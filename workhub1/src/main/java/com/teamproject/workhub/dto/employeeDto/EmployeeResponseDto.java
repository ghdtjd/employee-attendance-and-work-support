package com.teamproject.workhub.dto.employeeDto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.teamproject.workhub.entity.employeeEntity.Employee;
import com.teamproject.workhub.entity.userEntity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
@JsonPropertyOrder({
        "employeeNo",
        "name",
        "departmentName",
        "position",
        "email",
        "phone",
        "joinDate"
})
public class EmployeeResponseDto {
    private String employeeNo;
    private String name;
    private String email;
    private String phone;
    private String position;
    private LocalDate joinDate;
    private String departmentName;

    // User + Employee 정보를 받아서 DTO 생성
    public static EmployeeResponseDto from(User user, Employee employee) {
        return EmployeeResponseDto.builder()
                .employeeNo(user.getEmployeeNo())
                .name(employee.getName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .position(employee.getPosition())
                .joinDate(employee.getJoinDate())
                .departmentName(employee.getDepartment() != null ?
                                employee.getDepartment().getDepartName() : null)
                .build();
    }
}