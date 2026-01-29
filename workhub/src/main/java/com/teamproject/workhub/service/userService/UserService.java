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
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private EmployeeRepository employeeRepository;
    private DepartmentRepository departmentRepository;



    // 1. 사원 등록
    @Transactional
    public void registerUser(RegisterRequest request) {
    if(userRepository.existsByEmployeeNo(request.getEmployeeNo())) {
        throw new IllegalArgumentException("이미 존재하는 사번입니다.");
    }

    User user = request.toEntity();

    user.setPassword(passwordEncoder.encode(user.getPassword()));


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

    //2. 사원 로그인 (성공 시 시간 업데이트)

    @Transactional
    public User login(LoginRequest request) {

        User user = userRepository.findByEmployeeNo(request.getEmployeeNo()).orElse(null);

        if (user == null || passwordEncoder.matches(request.getPassword(), user.getPassword()) || !user.isActive()) {
            return null;
        }

        user.updateLastLogin();
        return user;
    }



}
