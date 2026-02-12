package com.teamproject.workhub.service.taskService;

import java.time.LocalDate;
import com.teamproject.workhub.dto.taskDto.TaskResponseDto;
import com.teamproject.workhub.dto.taskDto.TaskUpdateRequest;
import com.teamproject.workhub.entity.taskEntity.Task;
import com.teamproject.workhub.entity.taskEntity.TaskStatus;
import com.teamproject.workhub.repository.taskRepository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;

    public Task createTask(String title, String description, LocalDate dueDate, Long employeeId, Long userId) {
        Task task = Task.builder()
                .title(title)
                .description(description)
                .dueDate(dueDate)
                .employeeId(employeeId)
                .userId(userId)
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

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // 사원별 업무 조회
    public List<Task> getTasksByEmployeeId(Long employeeId) {
        return taskRepository.findByEmployeeId(employeeId);
    }

    // 업무 상세 조회
    public Task getTaskById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("タスクが見つかりません: " + taskId));
    }

    // 업무 수정
    @Transactional
    public Task updateTask(Long taskId, TaskUpdateRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("タスクが見つかりません: " + taskId));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());

        return task; // @Transactional에 의해 자동 저장됨
    }

    // 업무 삭제
    @Transactional
    public void deleteTask(Long taskId) {
        // 존재 여부 확인
        if (!taskRepository.existsById(taskId)) {
            throw new IllegalArgumentException("タスクが見つかりません: " + taskId);
        }
        taskRepository.deleteById(taskId);
    }

    // 업무 상태 변경
    @Transactional
    public TaskResponseDto updateTaskStatus(Long taskId, String status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("タスクが見つかりません: " + taskId));

        task.setStatus(TaskStatus.valueOf(status));
        Task updatedTask = taskRepository.save(task);

        return TaskResponseDto.from(updatedTask);
    }

    // 담당자 설정
    @Transactional
    public TaskResponseDto updateTaskAssignee(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("タスクが見つかりません: " + taskId));

        task.setUserId(userId);
        Task updatedTask = taskRepository.save(task);

        return TaskResponseDto.from(updatedTask);
    }

    @Transactional
    public Task approveTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("タスクが見つかりません: " + taskId));
        task.setStatus(TaskStatus.APPROVED);
        return taskRepository.save(task);
    }

    @Transactional
    public Task rejectTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("タスクが見つかりません: " + taskId));
        task.setStatus(TaskStatus.REJECTED);
        return taskRepository.save(task);
    }
}
