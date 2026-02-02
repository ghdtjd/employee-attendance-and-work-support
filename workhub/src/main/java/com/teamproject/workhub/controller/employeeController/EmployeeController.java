package com.teamproject.workhub.controller.employeeController;

import com.teamproject.workhub.dto.employeeDto.EmployeeResponseDto;
import com.teamproject.workhub.dto.employeeDto.EmployeeUpdateDto;
import com.teamproject.workhub.dto.userDto.UserResponseDto;
import com.teamproject.workhub.entity.employeeEntity.Employee;
import com.teamproject.workhub.entity.userEntity.User;
import com.teamproject.workhub.repository.EmployeeRepository.EmployeeRepository;
import com.teamproject.workhub.service.employeeService.EmployeeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/userinfo")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final EmployeeService employeeService;

    // 내 정보 조회
    @GetMapping("/me")
    public ResponseEntity<?> getMyInfo(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        User loginUser = (User) session.getAttribute("loginUser");

        Employee employee = employeeRepository.findByUser(loginUser)
                .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));

        EmployeeResponseDto userInfo = EmployeeResponseDto.from(loginUser, employee);
        return ResponseEntity.ok(userInfo);
    }

    // 내 정보 수정 (email, phone만 수정 가능)
    @PutMapping("/me")
    public ResponseEntity<String> updateMyInfo(
            @RequestBody EmployeeUpdateDto updateDto,
            HttpServletRequest request) {

        // 세션에서 로그인한 사용자 정보 가져오기
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        User loginUser = (User) session.getAttribute("loginUser");

        // 서비스 계층에서 업데이트 처리
        employeeService.updateMyInfo(loginUser, updateDto);

        return ResponseEntity.ok("내 정보가 수정되었습니다.");
    }
}