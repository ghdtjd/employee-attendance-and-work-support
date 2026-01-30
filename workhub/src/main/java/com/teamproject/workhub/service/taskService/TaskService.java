package com.teamproject.workhub.service.taskService;

import com.teamproject.workhub.entity.taskEntity.Task;
import com.teamproject.workhub.entity.taskEntity.TaskStatus;
import com.teamproject.workhub.repository.taskRepository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;

    public Task createTask(String title, String description) {
        Task task = Task.builder()
                .title(title)
                .description(description)
                .status(TaskStatus.TODO)
                .build();

        return taskRepository.save(task);
    }
    public Task updateTaskStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("タスクが見つかりません: " + taskId));

        task.updateStatus(newStatus);

        return task;
    }

}

