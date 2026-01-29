package com.teamproject.workhub.controller.userController;

import com.teamproject.workhub.dto.userDto.LoginRequest;
import com.teamproject.workhub.dto.userDto.RegisterRequest;
import com.teamproject.workhub.entity.employeeEntity.Employee;
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
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

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


    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if(session != null ) session.invalidate();

        return ResponseEntity.ok("로그아웃 성공!!!");

    }


    @GetMapping("/check-login")
    public ResponseEntity<Map<String, Object>> checkLogin(HttpServletRequest request) {


        HttpSession session = request.getSession(false);

        Object loginUserObj = session.getAttribute("loginUser");

        User user = (User) loginUserObj;

        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));


        Map<String, Object> response = new HashMap<>();

            response.put("employeeNo", user.getEmployeeNo());
            response.put("role", user.getRole());
            response.put("name", employee.getName());
            response.put("email", employee.getEmail());
            response.put("phone", employee.getPhone());
            response.put("position", employee.getPosition());

            return ResponseEntity.ok(response);

    }






}



