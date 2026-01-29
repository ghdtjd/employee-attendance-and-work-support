package com.teamproject.workhub.dto.userDto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordRequest {

    private Long userId;
    private String oldPassword;
    private String newPassword;





}
