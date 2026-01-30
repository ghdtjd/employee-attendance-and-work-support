package com.teamproject.workhub.dto.taskDto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class TaskCreateRequest {
    private String title;
    private String description;
}
