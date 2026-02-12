package com.teamproject.workhub.dto.taskDto;

import com.teamproject.workhub.entity.taskEntity.Task;
import com.teamproject.workhub.entity.taskEntity.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponseDto {
    private Long id;
    private Long employeeId;
    private Long userId;
    private Long departNo;
    private String title;
    private String description;
    private String assigneeName;  // ⭐ 추가!
    private TaskStatus status;
    private Integer priority;
    private LocalDate dueDate;    // ⭐ 추가!
    private LocalDateTime createdAt;

    // Entity → DTO 변환 메서드
    public static TaskResponseDto from(Task task) {
        return TaskResponseDto.builder()
                .id(task.getId())
                .employeeId(task.getEmployeeId())
                .userId(task.getUserId())
                .departNo(task.getDepartNo())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())  // ⭐ 추가!
                .createdAt(task.getCreatedAt())
                .build();
    }
}

