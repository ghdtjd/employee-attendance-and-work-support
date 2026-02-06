# Task API 구현 가이드

## 📌 전체 작업 목록

### ✅ 완료된 작업
- [x] POST /api/task - 업무 등록
- [x] TaskService.updateTaskStatus() - 상태 변경 로직

### ⏳ 미완료 작업 (아래 순서대로 구현)
1. GET /api/task - 업무 목록 조회
2. GET /api/task/{taskId} - 업무 상세 조회
3. PUT /api/task/{taskId} - 업무 수정
4. DELETE /api/task/{taskId} - 업무 삭제
5. PATCH /api/task/{taskId}/status - 상태 변경

---

## 1️⃣ GET /api/task - 업무 목록 조회

### 📁 작성할 파일 위치
```
workhub/src/main/java/com/teamproject/workhub/
├── dto/taskDto/TaskResponseDto.java (새로 생성)
├── service/taskService/TaskService.java (메서드 추가)
└── controller/taskController/TaskController.java (메서드 추가)
```

---

### 1. TaskResponseDto.java (새로 생성)
**위치**: `dto/taskDto/TaskResponseDto.java`

```java
package com.teamproject.workhub.dto.taskDto;

import com.teamproject.workhub.entity.taskEntity.Task;
import com.teamproject.workhub.entity.taskEntity.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
    private TaskStatus status;
    private Integer priority;
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
                .createdAt(task.getCreatedAt())
                .build();
    }
}
```

**설명**:
- Task Entity를 클라이언트에게 전달하기 위한 DTO
- `from()` 메서드로 Entity → DTO 변환 간편화

---

### 2. TaskService.java (메서드 추가)
**위치**: `service/taskService/TaskService.java`

**기존 코드 아래에 추가**:
```java
    // 업무 목록 전체 조회
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }
```

**설명**:
- `findAll()`은 JpaRepository에서 제공하는 기본 메서드
- 모든 Task를 조회해서 List로 반환

---

### 3. TaskController.java (메서드 추가)
**위치**: `controller/taskController/TaskController.java`

**기존 TODO 주석 아래에 추가**:
```java
    // GET /api/task - 업무 목록 조회
    @GetMapping
    public List<TaskResponseDto> getAllTasks() {
        List<Task> tasks = taskService.getAllTasks();
        return tasks.stream()
                .map(TaskResponseDto::from)
                .collect(Collectors.toList());
    }
```

**import 추가 필요**:
```java
import java.util.stream.Collectors;
import com.teamproject.workhub.dto.taskDto.TaskResponseDto;
import java.util.List;
```

**설명**:
- Service에서 Task 리스트를 받아옴
- Stream API로 각 Task를 TaskResponseDto로 변환

---

### 4. 테스트 방법
**Postman/Thunder Client**:
```
GET http://localhost:8080/api/task
```

**예상 응답**:
```json
[
  {
    "id": 1,
    "employeeId": null,
    "userId": null,
    "departNo": null,
    "title": "첫 번째 업무",
    "description": "업무 설명",
    "status": "TODO",
    "priority": null,
    "createdAt": "2026-01-30T10:30:00"
  }
]
```

---

## 2️⃣ GET /api/task/{taskId} - 업무 상세 조회

### 📁 작성할 파일
```
├── service/taskService/TaskService.java (메서드 추가)
└── controller/taskController/TaskController.java (메서드 추가)
```

---

### 1. TaskService.java (메서드 추가)
**위치**: `service/taskService/TaskService.java`

```java
    // 업무 상세 조회
    public Task getTaskById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("업무를 찾을 수 없습니다: " + taskId));
    }
```

**설명**:
- `findById()`는 Optional<Task> 반환
- 없으면 예외 발생 (이미 updateTaskStatus에서 사용 중인 패턴)

---

### 2. TaskController.java (메서드 추가)
**위치**: `controller/taskController/TaskController.java`

```java
    // GET /api/task/{taskId} - 업무 상세 조회
    @GetMapping("/{taskId}")
    public TaskResponseDto getTaskById(@PathVariable Long taskId) {
        Task task = taskService.getTaskById(taskId);
        return TaskResponseDto.from(task);
    }
```

**import 추가 필요**:
```java
import org.springframework.web.bind.annotation.PathVariable;
```

**설명**:
- `@PathVariable`로 URL의 taskId 추출
- Task를 조회한 후 DTO로 변환해서 반환

---

### 3. 테스트 방법
```
GET http://localhost:8080/api/task/1
```

**예상 응답**:
```json
{
  "id": 1,
  "title": "첫 번째 업무",
  "description": "업무 설명",
  "status": "TODO",
  "createdAt": "2026-01-30T10:30:00"
}
```

---

## 3️⃣ PUT /api/task/{taskId} - 업무 수정

### 📁 작성할 파일
```
workhub/src/main/java/com/teamproject/workhub/
├── dto/taskDto/TaskUpdateRequest.java (새로 생성)
├── service/taskService/TaskService.java (메서드 추가)
└── controller/taskController/TaskController.java (메서드 추가)
```

---

### 1. TaskUpdateRequest.java (새로 생성)
**위치**: `dto/taskDto/TaskUpdateRequest.java`

```java
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
```

**설명**:
- 수정 가능한 필드만 포함
- employeeId, userId 등은 수정 불가하므로 포함 안 함

---

### 2. TaskService.java (메서드 추가)
**위치**: `service/taskService/TaskService.java`

```java
    // 업무 수정
    @Transactional
    public Task updateTask(Long taskId, TaskUpdateRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("업무를 찾을 수 없습니다: " + taskId));

        // 필드 업데이트
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());

        return task; // @Transactional에 의해 자동 저장됨
    }
```

**import 추가 필요**:
```java
import com.teamproject.workhub.dto.taskDto.TaskUpdateRequest;
```

**설명**:
- `@Transactional` 안에서 엔티티 수정 → JPA가 자동으로 UPDATE 쿼리 실행 (Dirty Checking)
- `save()` 호출 불필요

---

### 3. TaskController.java (메서드 추가)
**위치**: `controller/taskController/TaskController.java`

```java
    // PUT /api/task/{taskId} - 업무 수정
    @PutMapping("/{taskId}")
    public TaskResponseDto updateTask(
            @PathVariable Long taskId,
            @RequestBody TaskUpdateRequest request) {
        Task updatedTask = taskService.updateTask(taskId, request);
        return TaskResponseDto.from(updatedTask);
    }
```

**import 추가 필요**:
```java
import org.springframework.web.bind.annotation.PutMapping;
import com.teamproject.workhub.dto.taskDto.TaskUpdateRequest;
```

**설명**:
- `@PutMapping`으로 PUT 요청 처리
- 수정된 Task를 DTO로 변환해서 반환

---

### 4. 테스트 방법
```
PUT http://localhost:8080/api/task/1
Content-Type: application/json

{
  "title": "수정된 업무 제목",
  "description": "수정된 설명",
  "status": "IN_PROGRESS",
  "priority": 1
}
```

**예상 응답**:
```json
{
  "id": 1,
  "title": "수정된 업무 제목",
  "description": "수정된 설명",
  "status": "IN_PROGRESS",
  "priority": 1
}
```

---

## 4️⃣ DELETE /api/task/{taskId} - 업무 삭제

### 📁 작성할 파일
```
├── service/taskService/TaskService.java (메서드 추가)
└── controller/taskController/TaskController.java (메서드 추가)
```

---

### 1. TaskService.java (메서드 추가)
**위치**: `service/taskService/TaskService.java`

```java
    // 업무 삭제
    @Transactional
    public void deleteTask(Long taskId) {
        // 존재 여부 확인
        if (!taskRepository.existsById(taskId)) {
            throw new IllegalArgumentException("업무를 찾을 수 없습니다: " + taskId);
        }
        taskRepository.deleteById(taskId);
    }
```

**설명**:
- `existsById()`로 존재 여부 먼저 확인 (없으면 예외)
- `deleteById()`로 삭제

---

### 2. TaskController.java (메서드 추가)
**위치**: `controller/taskController/TaskController.java`

```java
    // DELETE /api/task/{taskId} - 업무 삭제
    @DeleteMapping("/{taskId}")
    public ResponseEntity<String> deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.ok("업무가 삭제되었습니다.");
    }
```

**import 추가 필요**:
```java
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.http.ResponseEntity;
```

**설명**:
- 삭제 후 성공 메시지 반환
- `ResponseEntity<Void>`와 `return ResponseEntity.noContent().build();`로 해도 됨

---

### 3. 테스트 방법
```
DELETE http://localhost:8080/api/task/1
```

**예상 응답**:
```
업무가 삭제되었습니다.
```

---

## 5️⃣ PATCH /api/task/{taskId}/status - 상태 변경

### 📁 작성할 파일
```
└── controller/taskController/TaskController.java (메서드 추가만)
```

**⚠️ Service는 이미 구현됨** (`updateTaskStatus()` 메서드 존재)

---

### 1. TaskController.java (메서드 추가)
**위치**: `controller/taskController/TaskController.java`

**방법 1 - RequestParam 사용 (간단함, 추천)**:
```java
    // PATCH /api/task/{taskId}/status - 상태 변경
    @PatchMapping("/{taskId}/status")
    public TaskResponseDto updateTaskStatus(
            @PathVariable Long taskId,
            @RequestParam TaskStatus status) {
        Task updatedTask = taskService.updateTaskStatus(taskId, status);
        return TaskResponseDto.from(updatedTask);
    }
```

**방법 2 - RequestBody 사용**:
```java
    // PATCH /api/task/{taskId}/status - 상태 변경
    @PatchMapping("/{taskId}/status")
    public TaskResponseDto updateTaskStatus(
            @PathVariable Long taskId,
            @RequestBody Map<String, TaskStatus> request) {
        Task updatedTask = taskService.updateTaskStatus(taskId, request.get("status"));
        return TaskResponseDto.from(updatedTask);
    }
```

**import 추가 필요**:
```java
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestParam; // 방법 1
import java.util.Map; // 방법 2
import com.teamproject.workhub.entity.taskEntity.TaskStatus;
```

---

### 2. 테스트 방법

**방법 1 테스트**:
```
PATCH http://localhost:8080/api/task/1/status?status=IN_PROGRESS
```

**방법 2 테스트**:
```
PATCH http://localhost:8080/api/task/1/status
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

**예상 응답**:
```json
{
  "id": 1,
  "title": "업무 제목",
  "status": "IN_PROGRESS"
}
```

---

## 📋 전체 작업 체크리스트

### 새로 생성할 파일 (2개)
- [ ] `dto/taskDto/TaskResponseDto.java`
- [ ] `dto/taskDto/TaskUpdateRequest.java`

### 수정할 파일 (2개)
- [ ] `service/taskService/TaskService.java` (메서드 4개 추가)
  - [ ] getAllTasks()
  - [ ] getTaskById()
  - [ ] updateTask()
  - [ ] deleteTask()

- [ ] `controller/taskController/TaskController.java` (메서드 5개 추가)
  - [ ] GET /api/task
  - [ ] GET /api/task/{taskId}
  - [ ] PUT /api/task/{taskId}
  - [ ] DELETE /api/task/{taskId}
  - [ ] PATCH /api/task/{taskId}/status

---

## 💡 추가 팁

### 1. 작업 순서 추천
1. DTO 2개부터 먼저 만들기
2. Service 메서드 4개 추가
3. Controller 메서드 5개 추가
4. 하나씩 테스트하면서 진행

### 2. import 정리
- IntelliJ: `Ctrl + Alt + O` (Windows/Linux)
- IntelliJ: `Cmd + Option + O` (Mac)

### 3. 코드 포맷팅
- IntelliJ: `Ctrl + Alt + L` (Windows/Linux)
- IntelliJ: `Cmd + Option + L` (Mac)

### 4. 참고할 기존 코드
- `UserController.java` - Controller 패턴 참고
- `EmployeeController.java` - DTO 변환 패턴 참고
- `TaskService.updateTaskStatus()` - 예외 처리 패턴 참고

---

## 🎯 최종 목표

모든 작업 완료 시 TaskController는 다음과 같은 형태가 됩니다:

```java
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/task")
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/test")
    public String test() {
        return "TaskController OK";
    }

    @PostMapping
    public Task createTask(@RequestBody TaskCreateRequest request) { ... }

    @GetMapping
    public List<TaskResponseDto> getAllTasks() { ... }

    @GetMapping("/{taskId}")
    public TaskResponseDto getTaskById(@PathVariable Long taskId) { ... }

    @PutMapping("/{taskId}")
    public TaskResponseDto updateTask(@PathVariable Long taskId, @RequestBody TaskUpdateRequest request) { ... }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<String> deleteTask(@PathVariable Long taskId) { ... }

    @PatchMapping("/{taskId}/status")
    public TaskResponseDto updateTaskStatus(@PathVariable Long taskId, @RequestParam TaskStatus status) { ... }
}
```

**총 7개 엔드포인트 완성!**
