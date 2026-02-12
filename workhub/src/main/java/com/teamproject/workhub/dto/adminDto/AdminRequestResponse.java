package com.teamproject.workhub.dto.adminDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminRequestResponse {
    private Long id;
    private String type; // "TASK" or "OBJECTION"
    private String employeeNo;
    private String employeeName;
    private String title;
    private String description;
    private String status;
    private LocalDateTime createdAt;
}
