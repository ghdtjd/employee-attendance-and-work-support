package com.teamproject.workhub.service.userService;


import com.teamproject.workhub.dto.employeeDto.EmployeeRequest;
import com.teamproject.workhub.dto.userDto.LoginRequest;
import com.teamproject.workhub.dto.userDto.RegisterRequest;
import com.teamproject.workhub.entity.DepartmentEntity.Department;
import com.teamproject.workhub.entity.employeeEntity.Employee;
import com.teamproject.workhub.entity.userEntity.Role;
import com.teamproject.workhub.entity.userEntity.User;
import com.teamproject.workhub.repository.EmployeeRepository.EmployeeRepository;
import com.teamproject.workhub.repository.departmentRepository.DepartmentRepository;
import com.teamproject.workhub.repository.userRepository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    // 1. 사원 등록 (무조건 USER, 비번 1111)

    @jakarta.transaction.Transactional
    public void registerUser(RegisterRequest request) {
        if (userRepository.existsByEmployeeNo(request.getEmployeeNo())) {
            throw new IllegalArgumentException("이미 존재하는 사번입니다.");
        }

        User user = User.builder()
                .employeeNo(request.getEmployeeNo())
                .password(passwordEncoder.encode("1111"))
                .role(Role.USER)
                .isActive(true)
                .mustChangePassword(true)
                .build();

        User savedUser = userRepository.save(user);


        Department dept = departmentRepository.findById(request.getDepartNo()).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 부서 코드입니다."));

        Employee employee = Employee.builder()
                .user(savedUser)
                .employeeNo(request.getEmployeeNo())
                .name(request.getName())
                .department(dept)
                .email(request.getEmail())
                .phone(request.getPhone())
                .position(request.getPosition())
                .joinDate(request.getJoinDate())
                .build();

        employeeRepository.save(employee);

    }

    // 2. 사원 로그인 (성공 시 시간 업데이트 )
    // 나중에 비밀번호 변경

    @jakarta.transaction.Transactional
    public User login(LoginRequest request) {
        User user = userRepository.findByEmployeeNo(request.getEmployeeNo()).orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword()) || !user.isActive()) {
            return null;
        }
        user.updateLastLogin(); // 마지막 로그인 시간 갱신
        return user;
    }


    // 전체 사원 목록

    public List<Employee> getAllEmployee() {
        return employeeRepository.findAll();
    }




    // 비밀번호 초기화
    public String resetPassword(Long id) {
        Optional<User> user = userRepository.findById(id);


        if (user.isPresent()) {
            User userPassword = user.get();
            userPassword.setPassword(passwordEncoder.encode("0000"));
            userRepository.save(userPassword);
            return "비밀번호가 0000으로 초기화되었습니다.";
        } else {
            return "해당하는 유저가 없습니다.";
        }

    }








}
