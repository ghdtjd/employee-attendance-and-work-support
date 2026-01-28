package com.teamproject.workhub.dto.userDto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    private String employeeNo;
    private String password;
}
