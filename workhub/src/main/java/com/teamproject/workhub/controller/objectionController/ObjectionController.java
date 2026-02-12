package com.teamproject.workhub.controller.objectionController;

import com.teamproject.workhub.entity.objectionRequest.ObjectionRequest;
import com.teamproject.workhub.entity.userEntity.User;
import com.teamproject.workhub.service.objectionService.ObjectionService;
import com.teamproject.workhub.service.userService.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/objections")
public class ObjectionController {

    @Autowired
    private ObjectionService service;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> createObjection(@RequestBody ObjectionRequestDto dto, Principal principal) {
        User user = userService.findByEmployeeNo(principal.getName());
        return ResponseEntity.ok(service.submitObjection(user, dto));
    }

    @GetMapping
    public ResponseEntity<List<ObjectionRequest>> getMyObjections(Principal principal) {
        User user = userService.findByEmployeeNo(principal.getName());
        return ResponseEntity.ok(service.getMyObjections(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteObjection(@PathVariable Long id, Principal principal) {
        User user = userService.findByEmployeeNo(principal.getName());
        service.cancelObjection(id, user);
        return ResponseEntity.noContent().build();
    }
}
