package com.teamproject.workhub.controller.userController;

import com.teamproject.workhub.dto.adminDto.AdminDashboardStatsResponse;
import com.teamproject.workhub.dto.employeeDto.AdminEmployeeUpdateRequest;
import com.teamproject.workhub.entity.objectionRequest.ObjectionStatus;
import com.teamproject.workhub.entity.userEntity.Role;
import com.teamproject.workhub.entity.userEntity.User;
import com.teamproject.workhub.entity.request.Request;
import com.teamproject.workhub.entity.request.RequestStatus;
import com.teamproject.workhub.entity.request.RequestType;
import com.teamproject.workhub.repository.EmployeeRepository.EmployeeRepository;
import com.teamproject.workhub.repository.attendanceRepository.AttendanceRepository;
import com.teamproject.workhub.repository.objectionRepository.ObjectionRepository;
import com.teamproject.workhub.service.objectionService.ObjectionService;
import com.teamproject.workhub.service.userService.UserService;
import com.teamproject.workhub.service.request.RequestService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final ObjectionRepository objectionRepository;
    private final ObjectionService objectionService;
    private final RequestService requestService;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
        }

        long totalEmployees = employeeRepository.count();
        long todayAttendance = attendanceRepository.countByWorkDate(LocalDate.now());
        long pendingCorrections = objectionRepository.countByStatus(ObjectionStatus.PENDING);

        double attendanceRate = totalEmployees > 0 ? (double) todayAttendance / totalEmployees * 100 : 0;

        AdminDashboardStatsResponse stats = AdminDashboardStatsResponse.builder()
                .totalEmployees(totalEmployees)
                .todayAttendanceCount(todayAttendance)
                .pendingCorrectionsCount(pendingCorrections)
                .attendanceRate(Math.round(attendanceRate * 10) / 10.0)
                .build();

        return ResponseEntity.ok(stats);
    }

    @PutMapping("/employees/{employeeId}")
    public ResponseEntity<?> updateEmployee(
            @PathVariable Long employeeId,
            @RequestBody AdminEmployeeUpdateRequest updateRequest,
            HttpServletRequest request) {

        if (!isAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
        }

        try {
            userService.updateEmployeeByAdmin(employeeId, updateRequest);
            return ResponseEntity.ok("사원 정보가 성공적으로 수정되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 모든 정정 요청 조회
    @GetMapping("/objections")
    public ResponseEntity<?> getAllObjections(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
        }

        List<com.teamproject.workhub.entity.objectionRequest.ObjectionRequest> objections = objectionService
                .getAllObjections();
        List<com.teamproject.workhub.dto.adminDto.AdminRequestResponse> response = objections.stream()
                .map(o -> {
                    com.teamproject.workhub.entity.employeeEntity.Employee employee = employeeRepository
                            .findByUser(o.getUser()).orElse(null);
                    return com.teamproject.workhub.dto.adminDto.AdminRequestResponse.builder()
                            .id(o.getId())
                            .type("OBJECTION")
                            .employeeNo(o.getUser().getEmployeeNo())
                            .employeeName(employee != null ? employee.getName() : "알수없음")
                            .title("[이의신청] " + o.getCategory())
                            .description("날짜: " + o.getAttendanceDate() + "\n사유: " + o.getReason())
                            .status(o.getStatus().name())
                            .createdAt(o.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // 정정 요청 상태 변경 (승인/거절)
    @PutMapping("/objections/{id}/status")
    public ResponseEntity<?> updateObjectionStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
        }
        String statusStr = body.get("status");
        com.teamproject.workhub.entity.objectionRequest.ObjectionStatus status = com.teamproject.workhub.entity.objectionRequest.ObjectionStatus
                .valueOf(statusStr);
        return ResponseEntity.ok(objectionService.updateStatus(id, status));
    }

    // 휴가/재택 신청 업무 조회
    @GetMapping("/requests")
    public ResponseEntity<?> getAllRequests(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
        }

        List<Request> requests = requestService.getAllRequests();
        List<com.teamproject.workhub.dto.adminDto.AdminRequestResponse> response = requests.stream()
                .map(wr -> {
                    com.teamproject.workhub.entity.employeeEntity.Employee employee = employeeRepository
                            .findByUser(wr.getUser()).orElse(null);
                    return com.teamproject.workhub.dto.adminDto.AdminRequestResponse.builder()
                            .id(wr.getId())
                            .type("WORK_REQUEST")
                            .employeeNo(wr.getUser().getEmployeeNo())
                            .employeeName(employee != null ? employee.getName() : "알수없음")
                            .title("[" + (wr.getType() == RequestType.LEAVE ? "휴가" : "재택") + "] "
                                    + (wr.getType() == RequestType.LEAVE ? "휴가 신청" : "재택근무 신청"))
                            .description(
                                    "기간: " + wr.getStartDate() + " ~ " + wr.getEndDate() + "\n사유: " + wr.getReason())
                            .status(wr.getStatus().name())
                            .createdAt(wr.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // 휴가/재택 신청 승인
    @PutMapping("/requests/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
        }
        return ResponseEntity.ok(requestService.updateStatus(id, RequestStatus.APPROVED));
    }

    // 휴가/재택 신청 거절
    @PutMapping("/requests/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
        }
        return ResponseEntity.ok(requestService.updateStatus(id, RequestStatus.REJECTED));
    }

    private boolean isAdmin(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            return false;
        }
        User user = (User) session.getAttribute("loginUser");
        return user.getRole() == Role.ADMIN;
    }
}
