package com.teamproject.workhub.controller.employeeController;

import com.teamproject.workhub.dto.employeeDto.EmployeeResponseDto;
import com.teamproject.workhub.dto.userDto.UserResponseDto;
import com.teamproject.workhub.entity.employeeEntity.Employee;
import com.teamproject.workhub.entity.userEntity.User;
import com.teamproject.workhub.repository.EmployeeRepository.EmployeeRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


// 로그인한 사용자 정보 조회 컨트롤러

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/userinfo")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    // 로그인한 사용자 본인의 정보 조회

    @GetMapping("/me")
    public ResponseEntity<?> getMyInfo(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        User loginUser = (User) session.getAttribute("loginUser");

        // Employee 조회 추가
        Employee employee = employeeRepository.findByUser(loginUser)
                .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));

        EmployeeResponseDto employeeInfo = EmployeeResponseDto.from(loginUser, employee);
        return ResponseEntity.ok(employeeInfo);
    }
}

