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
                "employeeId",
                "employeeNo",
                "name",
                "departmentName",
                "position",
                "email",
                "phone",
                "joinDate"
})
public class EmployeeResponseDto {
        private Long employeeId;
        private String employeeNo;
        private String name;
        private String email;
        private String phone;
        private String position;
        private LocalDate joinDate;
        private String departmentName;
        private Double totalLeave;
        private Double usedLeave;
        private Double remainingLeave;

        // User + Employee 정보를 받아서 DTO 생성
        public static EmployeeResponseDto from(User user, Employee employee) {
                return EmployeeResponseDto.builder()
                                .employeeId(employee.getEmployeeId())
                                .employeeNo(user.getEmployeeNo())
                                .name(employee.getName())
                                .email(employee.getEmail())
                                .phone(employee.getPhone())
                                .position(employee.getPosition())
                                .joinDate(employee.getJoinDate())
                                .departmentName(employee.getDepartment() != null
                                                ? employee.getDepartment().getDepartName()
                                                : null)
                                .totalLeave(employee.getTotalLeave())
                                .usedLeave(employee.getUsedLeave())
                                .remainingLeave((employee.getTotalLeave() != null ? employee.getTotalLeave() : 0.0) -
                                                (employee.getUsedLeave() != null ? employee.getUsedLeave() : 0.0))
                                .build();
        }
}