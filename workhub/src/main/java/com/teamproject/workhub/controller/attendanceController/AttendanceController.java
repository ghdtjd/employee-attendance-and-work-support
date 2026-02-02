package com.teamproject.workhub.controller.attendanceController;

import com.teamproject.workhub.dto.attendanceDto.AttendanceResponseDto;
import com.teamproject.workhub.entity.attendanceEntity.AttendanceStatus;
import com.teamproject.workhub.entity.userEntity.User;
import com.teamproject.workhub.service.attendanceService.AttendanceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.teamproject.workhub.dto.attendanceDto.AttendanceCheckInDto;
import java.time.LocalDate;
import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    // 내 전체 근태 이력 조회
    @GetMapping("/me")
    public ResponseEntity getMyAttendance(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        User loginUser = (User) session.getAttribute("loginUser");

        List attendances = attendanceService.getMyAttendance(loginUser);
        return ResponseEntity.ok(attendances);
    }

    // 특정 기간 근태 조회
    @GetMapping("/me/period")
    public ResponseEntity getMyAttendanceByPeriod(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        User loginUser = (User) session.getAttribute("loginUser");

        List attendances =
                attendanceService.getMyAttendanceByPeriod(loginUser, startDate, endDate);
        return ResponseEntity.ok(attendances);
    }

    // 특정 월 근태 조회
    @GetMapping("/me/month")
    public ResponseEntity getMyAttendanceByMonth(
            @RequestParam int year,
            @RequestParam int month,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        User loginUser = (User) session.getAttribute("loginUser");

        List attendances =
                attendanceService.getMyAttendanceByMonth(loginUser, year, month);
        return ResponseEntity.ok(attendances);
    }

    // 특정 상태 근태 조회 (예: 지각만, 휴가만)
    @GetMapping("/me/status/{status}")
    public ResponseEntity getMyAttendanceByStatus(
            @PathVariable AttendanceStatus status,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        User loginUser = (User) session.getAttribute("loginUser");

        List attendances =
                attendanceService.getMyAttendanceByStatus(loginUser, status);
        return ResponseEntity.ok(attendances);
    }

    // 출근 기록
    @PostMapping("/check-in")
    public ResponseEntity<?> checkIn(
            @RequestBody(required = false) AttendanceCheckInDto checkInDto,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        User loginUser = (User) session.getAttribute("loginUser");

        try {
            String notes = checkInDto != null ? checkInDto.getNotes() : null;
            AttendanceResponseDto attendance = attendanceService.checkIn(loginUser, notes);
            return ResponseEntity.ok(attendance);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // 퇴근 기록
    @PostMapping("/check-out")
    public ResponseEntity<?> checkOut(HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        User loginUser = (User) session.getAttribute("loginUser");

        try {
            AttendanceResponseDto attendance = attendanceService.checkOut(loginUser);
            return ResponseEntity.ok(attendance);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // 오늘 근태 조회
    @GetMapping("/today")
    public ResponseEntity<?> getTodayAttendance(HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        User loginUser = (User) session.getAttribute("loginUser");

        AttendanceResponseDto attendance = attendanceService.getTodayAttendance(loginUser);

        if (attendance == null) {
            return ResponseEntity.ok("오늘 근태 기록이 없습니다.");
        }

        return ResponseEntity.ok(attendance);
    }
}
