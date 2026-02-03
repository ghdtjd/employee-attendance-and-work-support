package com.teamproject.workhub.controller.attendanceController;

import com.teamproject.workhub.dto.attendanceDto.AttendanceResponseDto;
import com.teamproject.workhub.service.attendanceService.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/attendance")
@RequiredArgsConstructor
public class AdminAttendanceController {

    private final AttendanceService attendanceService;

    // 관리자용: 전체 사원 근태 이력 조회
    @GetMapping
    public ResponseEntity<List<AttendanceResponseDto>> getAllAttendance() {
        List<AttendanceResponseDto> attendances = attendanceService.getAllAttendance();
        return ResponseEntity.ok(attendances);
    }
}