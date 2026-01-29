package com.teamproject.workhub.controller.userController;

import com.teamproject.workhub.dto.userDto.LoginRequest;
import com.teamproject.workhub.dto.userDto.RegisterRequest;
import com.teamproject.workhub.entity.userEntity.User;
import com.teamproject.workhub.repository.EmployeeRepository.EmployeeRepository;
import com.teamproject.workhub.service.userService.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.HttpRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class UserController {

    private final UserService userService;
    private final EmployeeRepository employeeRepository;


    @PostMapping("/admin/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request, Long userId) {
        userService.registerUser(request);

        return ResponseEntity.ok(("사원 등록 완료!!"));

    }


    // 로그인
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        User user = userService.login(loginRequest);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 실패");
        }

        HttpSession session = request.getSession();
        session.setAttribute("loginUser", user);

        return ResponseEntity.ok("로그인 성공!");

    }



}



