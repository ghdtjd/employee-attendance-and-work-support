package com.teamproject.workhub.controller.objectionController;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ObjectionRequestDto {
    private LocalDate attendanceDate;
    private String category;
    private String reason;
}
