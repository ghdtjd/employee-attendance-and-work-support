package com.teamproject.workhub.dto.taskDto;

import com.teamproject.workhub.entity.taskEntity.TaskStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskUpdateRequest {
    private String title;
    private String description;
    private TaskStatus status;
    private Integer priority;
}