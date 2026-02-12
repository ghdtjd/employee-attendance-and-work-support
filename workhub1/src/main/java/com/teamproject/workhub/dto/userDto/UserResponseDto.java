package com.teamproject.workhub.dto.userDto;

import com.teamproject.workhub.entity.employeeEntity.Employee;
import com.teamproject.workhub.entity.userEntity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponseDto {
    private Long id;
    private String employeeNo;
    private String role;
    private boolean isActive;
    private String name;
    private String email;


    public static UserResponseDto from(User user, Employee employee) {
        return UserResponseDto.builder()
            .id(user.getId())
            .employeeNo(user.getEmployeeNo())
            .role(user.getRole().name())
            .isActive(user.isActive())
            .email(employee.getEmail())
            .build();
    }

}
