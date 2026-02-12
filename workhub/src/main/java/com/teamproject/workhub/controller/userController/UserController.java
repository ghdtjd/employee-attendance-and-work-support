package com.teamproject.workhub.controller.userController;

import com.teamproject.workhub.dto.employeeDto.EmployeeRequest;
import com.teamproject.workhub.dto.employeeDto.EmployeeResponseDto;
import com.teamproject.workhub.dto.userDto.LoginRequest;
import com.teamproject.workhub.dto.userDto.PasswordRequest;
import com.teamproject.workhub.dto.userDto.RegisterRequest;
import com.teamproject.workhub.entity.employeeEntity.Employee;
import com.teamproject.workhub.entity.userEntity.User;
import com.teamproject.workhub.repository.EmployeeRepository.EmployeeRepository;
import com.teamproject.workhub.service.userService.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class UserController {

    private final UserService userService;
    private final EmployeeRepository employeeRepository;

    // 관리자: 사원 등록
    @PostMapping("/admin/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        userService.registerUser(request);

        return ResponseEntity.ok("사원 등록 완료 (사번: " + request.getEmployeeNo() + ", 비번: 1111");

    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        User user = userService.login(loginRequest);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 실패(정보 확인 필요");

        }

        HttpSession session = request.getSession();
        session.setAttribute("loginUser", user);

        return ResponseEntity.ok("로그인 성공!!");
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null)
            session.invalidate();
        return ResponseEntity.ok("로그아웃 성공!!!");
    }

    // 세션 확인
    @GetMapping("/check-login")
    public ResponseEntity<?> checkLogin(HttpServletRequest request) { // Map<String, Object> -> ? 로 변경 (401 반환을 위해)
        System.out.println("================ check-login 요청 들어옴 ================");

        // 세션이 있는지 확인 (false: 없으면 null 반환)
        HttpSession session = request.getSession(false);

        // 1. 세션 자체가 없는 경우 처리
        if (session == null) {
            System.out.println("세션이 없습니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. 세션은 있지만 로그인 유저 정보가 없는 경우 처리
        Object loginUserObj = session.getAttribute("loginUser");
        if (loginUserObj == null) {
            System.out.println("로그인 유저 정보가 세션에 없습니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 세션에서 User 객체 형변환
        User user = (User) loginUserObj;

        // User 정보로 Employee 정보 조회 (Optional 처리)
        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));

        // 응답 데이터 구성
        Map<String, Object> response = new HashMap<>();

        response.put("id", user.getId());
        response.put("employeeId", employee.getEmployeeId());
        response.put("employeeNo", user.getEmployeeNo());
        response.put("role", user.getRole());
        response.put("name", employee.getName());
        response.put("email", employee.getEmail());
        response.put("phone", employee.getPhone());
        response.put("position", employee.getPosition());
        response.put("joinDate", employee.getJoinDate());

        if (employee.getDepartment() != null) {
            response.put("department", employee.getDepartment().getDepartName());
        } else {
            response.put("department", "부서 미정");
        }

        return ResponseEntity.ok(response);
    }

    // 사원 전체 조회

    @GetMapping("/admin/employees")
    public List<EmployeeResponseDto> getEmployeeList() {
        return userService.getAllEmployee().stream()
                .map(employee -> EmployeeResponseDto.from(employee.getUser(), employee))
                .collect(java.util.stream.Collectors.toList());
    }

    // Password 초기화

    /*
     * @PostMapping ("/password/reset/{employeeId") {
     * 
     * }
     * 
     */

    // 내 정보 수정 (이메일, 전화번호)
    @PutMapping("/user/info")
    public ResponseEntity<String> updateUserInfo(@RequestBody EmployeeRequest request, HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        User loginUser = (User) session.getAttribute("loginUser");

        try {
            userService.updateUserInfo(loginUser, request);
            return ResponseEntity.ok("정보가 수정되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 비밀번호 변경
    @PostMapping("/user/password")
    public ResponseEntity<String> changePassword(@RequestBody PasswordRequest request, HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        User loginUser = (User) session.getAttribute("loginUser");

        try {
            userService.changePassword(loginUser, request.getOldPassword(), request.getNewPassword());
            // 세션 정보 업데이트 (선택 사항, 비밀번호 해시는 세션에 저장된 객체에는 바로 반영 안될 수 있음, 재로그인 유도 등)
            return ResponseEntity.ok("비밀번호가 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 관리자: 비밀번호 초기화
    @PostMapping("/admin/reset-password/{userId}")
    public ResponseEntity<String> resetPassword(@PathVariable Long userId) {
        String result = userService.resetPassword(userId);
        return ResponseEntity.ok(result);
    }
}
