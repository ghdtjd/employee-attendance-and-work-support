package com.teamproject.workhub.dto.userDto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PasswordChangeDto {
    private String currentPassword;
    private String newPassword;
}
