package com.teamproject.workhub.dto.userDto;

import com.teamproject.workhub.entity.employeeEntity.Employee;
import com.teamproject.workhub.entity.userEntity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponseDto {
    private Long id;
    private String employeeNo;
    private String email;
    private String role;
    private boolean isActive;

    public static UserResponseDto from(User user, Employee employee) {
    return UserResponseDto.builder()
            .id(user.getId())
            .employeeNo(user.getEmployeeNo())
            .email(employee.getEmail())  // Employee에서 가져옴
            .role(user.getRole().name())
            .isActive(user.isActive())
            .build();
    }

}
