package com.teamproject.workhub.controller.request;

import com.teamproject.workhub.dto.request.RequestDto;
import com.teamproject.workhub.entity.userEntity.User;
import com.teamproject.workhub.service.request.RequestService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/requests")
public class RequestController {

    private final RequestService service;

    private User getLoginUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            return null;
        }
        return (User) session.getAttribute("loginUser");
    }

    @PostMapping
    public ResponseEntity<?> submitRequest(@RequestBody RequestDto dto, HttpServletRequest request) {
        User user = getLoginUser(request);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        return ResponseEntity.ok(service.submitRequest(user, dto));
    }

    @GetMapping
    public ResponseEntity<?> getMyRequests(HttpServletRequest request) {
        User user = getLoginUser(request);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        return ResponseEntity.ok(service.getMyRequests(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelRequest(@PathVariable Long id, HttpServletRequest request) {
        User user = getLoginUser(request);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        try {
            service.cancelRequest(id, user);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
