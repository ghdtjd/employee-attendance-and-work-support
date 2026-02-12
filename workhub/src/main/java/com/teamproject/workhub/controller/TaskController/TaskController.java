package com.teamproject.workhub.controller.taskController;

import com.teamproject.workhub.dto.taskDto.TaskCreateRequest;
import com.teamproject.workhub.dto.taskDto.TaskResponseDto;
import com.teamproject.workhub.dto.taskDto.TaskUpdateRequest;
import com.teamproject.workhub.entity.employeeEntity.Employee;
import com.teamproject.workhub.entity.taskEntity.Task;
import com.teamproject.workhub.entity.userEntity.Role;
import com.teamproject.workhub.entity.userEntity.User;
import com.teamproject.workhub.repository.EmployeeRepository.EmployeeRepository;
import com.teamproject.workhub.service.taskService.TaskService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
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
    private final EmployeeRepository employeeRepository;

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

    // TODO: GET /tasks 작업 목록 조회
    @GetMapping
    public List<TaskResponseDto> getAllTasks(
            @RequestParam(name = "scope", required = false) String scope,
            HttpServletRequest httpRequest) {
        // 1. 세션에서 로그인한 사용자 정보 가져오기
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        User loginUser = (User) session.getAttribute("loginUser");
        List<Task> tasks;

        // 2. 권한 및 스코프에 따라 다른 목록 반환
        if (loginUser.getRole() == Role.ADMIN && "all".equals(scope)) {
            // 관리자: 명시적으로 전체 조회를 요청한 경우에만 모든 업무 반환
            tasks = taskService.getAllTasks();
        } else {
            // 본인의 개인 업무만 조회
            Employee loginEmployee = employeeRepository.findByUser(loginUser).orElse(null);

            if (loginEmployee != null) {
                // 사원 정보가 있으면 해당 사원ID로 필터링
                tasks = taskService.getTasksByEmployeeId(loginEmployee.getEmployeeId());
            } else {
                // 사원 정보가 없는 경우 (예: 특수 관리자 계정 등) - 본인이 직접 연관된 업무만 (UserId 기반)
                // 만약 완전한 격리를 원한다면 Collections.emptyList()를 반환해도 됨
                tasks = taskService.getAllTasks().stream()
                        .filter(t -> loginUser.getId().equals(t.getUserId()))
                        .filter(t -> t.getEmployeeId() == null) // 담당자가 없는 경우만 본인거로 간주
                        .collect(Collectors.toList());
            }
        }

        return tasks.stream()
                .map(TaskResponseDto::from)
                .collect(Collectors.toList());
    }

    // TODO: GET /tasks/{taskId} 작업 상세 조회
    @GetMapping("/{taskId}")
    public TaskResponseDto getTaskById(@PathVariable Long taskId) {
        Task task = taskService.getTaskById(taskId);
        return TaskResponseDto.from(task);
    }

    // TODO: POST /tasks 작업 등록
    @PostMapping
    public Task createTask(
            @RequestBody TaskCreateRequest request,
            HttpServletRequest httpRequest) { // ← HttpServletRequest 추가!

        // DEBUG
        System.out.println("=== CREATE TASK DEBUG ===");
        System.out.println("Title: " + request.getTitle());
        System.out.println("DueDate: " + request.getDueDate());
        System.out.println("EmployeeId: " + request.getEmployeeId());

        // 1. 세션에서 로그인한 사용자 정보 가져오기
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        User loginUser = (User) session.getAttribute("loginUser");

        // 2. 권한 체크
        if (loginUser.getRole() != Role.ADMIN) {
            // 일반 사용자: 본인 employeeId만 가능

            // User로부터 Employee 정보 가져오기
            Employee loginEmployee = employeeRepository.findByUser(loginUser)
                    .orElseThrow(() -> new IllegalArgumentException("사원 정보를 찾을 수 없습니다."));

            if (!request.getEmployeeId().equals(loginEmployee.getEmployeeId())) {
                throw new IllegalArgumentException("본인에게만 업무를 할당할 수 있습니다.");
            }
        }
        // 관리자는 모든 employeeId 가능 (체크 안 함)

        return taskService.createTask(
                request.getTitle(),
                request.getDescription(),
                request.getDueDate(),
                request.getEmployeeId(),
                request.getUserId());
    }

    // TODO: PUT /tasks/{taskId} 작업 수정
    @PutMapping("/{taskId}")
    public TaskResponseDto updateTask(
            @PathVariable Long taskId,
            @RequestBody TaskUpdateRequest request) {
        System.out.println("=== UPDATE TASK DEBUG ===");
        System.out.println("TaskId: " + taskId);
        System.out.println("Title: " + request.getTitle());
        System.out.println("DueDate: " + request.getDueDate());
        System.out.println("Status: " + request.getStatus());
        Task updatedTask = taskService.updateTask(taskId, request);
        return TaskResponseDto.from(updatedTask);
    }

    // TODO: DELETE /tasks/{taskId} 작업 삭제
    @DeleteMapping("/{taskId}")
    public ResponseEntity<String> deleteTask(@PathVariable Long taskId) {
        System.out.println("=== DELETE TASK DEBUG ===");
        System.out.println("TaskId: " + taskId);
        taskService.deleteTask(taskId);
        System.out.println("Task deleted successfully");
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
