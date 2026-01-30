package com.teamproject.workhub.controller.TaskController;

import com.teamproject.workhub.service.taskService.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/tasks")
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

    // =========================
    // TODO (기능은 하나씩 붙일 것)
    // =========================
    // TODO: GET    /tasks            작업 목록 조회
    // TODO: GET    /tasks/{taskId}   작업 상세 조회
    // TODO: POST   /tasks            작업 등록
    // TODO: PUT    /tasks/{taskId}   작업 수정
    // TODO: DELETE /tasks/{taskId}   작업 삭제
}
