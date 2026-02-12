package com.teamproject.workhub.controller.objectionController;

import com.teamproject.workhub.entity.userEntity.User;
import com.teamproject.workhub.service.objectionService.ObjectionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/objections")
public class ObjectionController {

    @Autowired
    private ObjectionService service;

    private User getLoginUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            return null;
        }
        return (User) session.getAttribute("loginUser");
    }

    @PostMapping
    public ResponseEntity<?> createObjection(@RequestBody ObjectionRequestDto dto, HttpServletRequest request) {
        User user = getLoginUser(request);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        return ResponseEntity.ok(service.submitObjection(user, dto));
    }

    @GetMapping
    public ResponseEntity<?> getMyObjections(HttpServletRequest request) {
        User user = getLoginUser(request);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        return ResponseEntity.ok(service.getMyObjections(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteObjection(@PathVariable Long id, HttpServletRequest request) {
        User user = getLoginUser(request);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        service.cancelObjection(id, user);
        return ResponseEntity.noContent().build();
    }
}
