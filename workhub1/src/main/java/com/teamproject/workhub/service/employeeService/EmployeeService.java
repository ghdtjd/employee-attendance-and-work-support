package com.teamproject.workhub.service.employeeService;

import com.teamproject.workhub.dto.employeeDto.EmployeeUpdateDto;
import com.teamproject.workhub.entity.employeeEntity.Employee;
import com.teamproject.workhub.entity.userEntity.User;
import com.teamproject.workhub.repository.EmployeeRepository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    // 내 정보 수정
    @Transactional
    public void updateMyInfo(User loginUser, EmployeeUpdateDto updateDto) {
        // 로그인한 User로 Employee 조회
        Employee employee = employeeRepository.findByUser(loginUser)
                .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));

        // Employee 엔티티의 updateMyInfo 메서드 호출
        employee.updateMyInfo(updateDto.getEmail(), updateDto.getPhone());

        // @Transactional 덕분에 자동으로 save() 호출됨 (Dirty Checking)
    }
}