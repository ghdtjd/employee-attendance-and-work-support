package com.teamproject.workhub.dto.taskDto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter

public class TaskCreateRequest {
    private String title;
    private String description;
    private LocalDate dueDate;
    private Long employeeId;
    private Long userId;
}
