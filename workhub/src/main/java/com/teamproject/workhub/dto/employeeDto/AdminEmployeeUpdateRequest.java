package com.teamproject.workhub.dto.employeeDto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class AdminEmployeeUpdateRequest {
    private String name;
    private String email;
    private String phone;
    private String position;
    private LocalDate joinDate;
    private Long departNo;
}
