package com.teamproject.workhub.controller.userController;

import com.teamproject.workhub.dto.userDto.LoginRequest;
import com.teamproject.workhub.dto.userDto.PasswordRequest;
import com.teamproject.workhub.dto.userDto.RegisterRequest;
import com.teamproject.workhub.entity.employeeEntity.Employee;
import com.teamproject.workhub.entity.userEntity.User;
import com.teamproject.workhub.repository.EmployeeRepository.EmployeeRepository;
import com.teamproject.workhub.service.employeeService.EmployeeService;
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
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class UserController {

    private final UserService userService;
    private final EmployeeRepository employeeRepository;


    // 관리자: 사원 등록
    @PostMapping("/admin/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request, Long userId) {
        userService.registerUser(request);

        return ResponseEntity.ok("사원 등록 완료 (사번: " + request.getEmployeeNo() + ", 비번: 1111");

    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        User user = userService.login(loginRequest);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 실패(정보 확인 필요");

        }

        HttpSession session = request.getSession();
        session.setAttribute("loginUser", user);

        return ResponseEntity.ok("로그인 성공!!");
    }


    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        return ResponseEntity.ok("로그아웃 성공!!!");
    }


    // 세션 확인
    @GetMapping("/check-login")
    public ResponseEntity<Map<String, Object>> checkLogin(HttpServletRequest request) {
        System.out.println("================ check-login 요청 들어옴 ================");

        //  세션이 있는지 확인 (false: 없으면 null 반환)
        HttpSession session = request.getSession(false);
        //  세션 안에 유저 정보가 들어있는지 확인
        Object loginUserObj = session.getAttribute("loginUser");

        // 세션에서 User 객체 형변환
        User user = (User) loginUserObj;

        // User 정보로 Employee 정보 조회 (Optional 처리)
        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));

        //  응답 데이터 구성
        Map<String, Object> response = new HashMap<>();


        // (주의) user.getEmployeeNo()가 맞는지 확인 필요. 보통은 employee.getEmployeeNo() 일 수 있음.
        // User 엔티티에 employeeNo 필드가 있다면 그대로 두셔도 됩니다.
        response.put("employeeNo", user.getEmployeeNo());
        response.put("role", user.getRole());
        response.put("name", employee.getName());
        response.put("email", employee.getEmail());
        response.put("phone", employee.getPhone());
        response.put("position", employee.getPosition());
        response.put("joinDate", employee.getJoinDate());

        return ResponseEntity.ok(response);
    }

    //사원 전체 조회

    @GetMapping("/admin/employees")
    public List<Employee> getEmployeeList() {
        return userService.getAllEmployee();
    }



    // Password 초기화

  /* @PostMapping ("/password/reset/{employeeId") {

   }

   */



}



