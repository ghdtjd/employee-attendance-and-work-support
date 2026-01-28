package com.teamproject.workhub.dto.userDto;


import com.teamproject.workhub.entity.userEntity.Role;
import com.teamproject.workhub.entity.userEntity.User;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class RegisterRequest {
    private String employeeNo;
    private String name;

    private String password;
    private Long departNo;
    private String email;
    private String phone;
    private String position;
    private LocalDate joinDate;

    public User toEntity() {
        return User.builder()
                .emplyoeeNo(employeeNo)
                .password(password)
                .role(Role.USER)
                .isActive(true)
                .mustChangepassword(true)
                .build();
    }
}
