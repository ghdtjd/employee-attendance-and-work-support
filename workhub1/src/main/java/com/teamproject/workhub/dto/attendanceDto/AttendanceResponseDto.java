package com.teamproject.workhub.dto.attendanceDto;

import com.teamproject.workhub.entity.attendanceEntity.Attendance;
import com.teamproject.workhub.entity.attendanceEntity.AttendanceStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
public class AttendanceResponseDto {
    private Long id;
    private LocalDate workDate;           // 근무 날짜
    private LocalTime checkInTime;        // 출근 시간
    private LocalTime checkOutTime;       // 퇴근 시간
    private String status;                // 근태 상태 (한글)
    private String statusCode;            // 근태 상태 코드 (NORMAL, LATE 등)
    private Double workHours;             // 근무 시간
    private String notes;                 // 비고

    public static AttendanceResponseDto from(Attendance attendance) {
        return AttendanceResponseDto.builder()
                .id(attendance.getId())
                .workDate(attendance.getWorkDate())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime())
                .status(attendance.getStatus().getDescription())
                .statusCode(attendance.getStatus().name())
                .workHours(attendance.getWorkHours())
                .notes(attendance.getNotes())
                .build();
    }
}