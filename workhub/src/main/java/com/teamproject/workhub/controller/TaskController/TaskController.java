package com.teamproject.workhub.controller.taskController;

import com.teamproject.workhub.dto.taskDto.TaskCreateRequest;
import com.teamproject.workhub.dto.taskDto.TaskResponseDto;
import com.teamproject.workhub.dto.taskDto.TaskUpdateRequest;
import com.teamproject.workhub.entity.taskEntity.Task;
import com.teamproject.workhub.service.taskService.TaskService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/task")
public class TaskController {

    private final TaskService taskService;

    /**
     * 컨트롤러 연결 테스트용
     * GET /tasks/test
     * - 서버가 살아있고, URL 매핑이 정상인지 확인하는 최소 엔드포인트
     * - 필요 없어지면 삭제해도 됨
     */
    @GetMapping("/test")
    public String test() {
        return "TaskController OK";
    }


    // TODO: GET    /tasks            작업 목록 조회
    @GetMapping
    public List<TaskResponseDto> getAllTasks() {
        List<Task> tasks = taskService.getAllTasks();
        return tasks.stream()
                .map(TaskResponseDto::from)
                .collect(Collectors.toList());
    }
    // TODO: GET    /tasks/{taskId}   작업 상세 조회
    @GetMapping("/{taskId}")
    public TaskResponseDto getTaskById(@PathVariable Long taskId) {
        Task task = taskService.getTaskById(taskId);
        return TaskResponseDto.from(task);
    }
    // TODO: POST   /tasks            작업 등록
    @PostMapping
    public Task createTask(@RequestBody TaskCreateRequest request) {
        return taskService.createTask(
                request.getTitle(),
                request.getDescription()
        );
    }
    // TODO: PUT    /tasks/{taskId}   작업 수정
    @PutMapping("/{taskId}")
    public TaskResponseDto updateTask(
            @PathVariable Long taskId,
            @RequestBody TaskUpdateRequest request) {
        Task updatedTask = taskService.updateTask(taskId, request);
        return TaskResponseDto.from(updatedTask);
    }
    // TODO: DELETE /tasks/{taskId}   작업 삭제
    @DeleteMapping("/{taskId}")
    public ResponseEntity<String> deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.ok("タスクが削除されました");
    }
    @PatchMapping("/{taskId}/status")
    public ResponseEntity<TaskResponseDto> updateTaskStatus(
            @PathVariable Long taskId,
            @RequestBody Map<String, String> request) {
        String status = request.get("status");
        TaskResponseDto response = taskService.updateTaskStatus(taskId, status);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{taskId}/assignee")
    public ResponseEntity<TaskResponseDto> updateTaskAssignee(
            @PathVariable Long taskId,
            @RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        TaskResponseDto response = taskService.updateTaskAssignee(taskId, userId);
        return ResponseEntity.ok(response);
    }
}
