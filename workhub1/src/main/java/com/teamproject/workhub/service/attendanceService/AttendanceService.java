package com.teamproject.workhub.service.attendanceService;

import com.teamproject.workhub.dto.attendanceDto.AttendanceResponseDto;
import com.teamproject.workhub.entity.attendanceEntity.Attendance;
import com.teamproject.workhub.entity.attendanceEntity.AttendanceStatus;
import com.teamproject.workhub.entity.employeeEntity.Employee;
import com.teamproject.workhub.entity.userEntity.User;
import com.teamproject.workhub.repository.EmployeeRepository.EmployeeRepository;
import com.teamproject.workhub.repository.attendanceRepository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalTime;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    // 내 전체 근태 이력 조회
    public List<AttendanceResponseDto> getMyAttendance(User loginUser) {
        Employee employee = employeeRepository.findByUser(loginUser)
                .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));

        List<Attendance> attendances = attendanceRepository.findByEmployeeOrderByWorkDateDesc(employee);

        return attendances.stream()
                .map(attendance -> AttendanceResponseDto.from(attendance))
                .collect(Collectors.toList());
    }

    // 특정 기간 근태 조회
    public List<AttendanceResponseDto> getMyAttendanceByPeriod(
            User loginUser, LocalDate startDate, LocalDate endDate) {

        Employee employee = employeeRepository.findByUser(loginUser)
                .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));

        List<Attendance> attendances = attendanceRepository
                .findByEmployeeAndWorkDateBetweenOrderByWorkDateDesc(employee, startDate, endDate);

        return attendances.stream()
                .map(attendance -> AttendanceResponseDto.from(attendance))
                .collect(Collectors.toList());
    }

    // 특정 월 근태 조회
    public List<AttendanceResponseDto> getMyAttendanceByMonth(User loginUser, int year, int month) {
        Employee employee = employeeRepository.findByUser(loginUser)
                .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));

        // 해당 월의 첫날과 마지막날
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startOfMonth = yearMonth.atDay(1);
        LocalDate endOfMonth = yearMonth.atEndOfMonth();

        List<Attendance> attendances = attendanceRepository
                .findByEmployeeAndWorkDateBetween(employee, startOfMonth, endOfMonth);

        return attendances.stream()
                .map(attendance -> AttendanceResponseDto.from(attendance))
                .collect(Collectors.toList());
    }

    // 특정 상태 근태 조회
    public List<AttendanceResponseDto> getMyAttendanceByStatus(
            User loginUser, AttendanceStatus status) {

        Employee employee = employeeRepository.findByUser(loginUser)
                .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));

        List<Attendance> attendances = attendanceRepository
                .findByEmployeeAndStatusOrderByWorkDateDesc(employee, status);

        return attendances.stream()
                .map(attendance -> AttendanceResponseDto.from(attendance))
                .collect(Collectors.toList());
    }

    // 출근 기록
    @Transactional
    public AttendanceResponseDto checkIn(User loginUser, String notes) {
        Employee employee = employeeRepository.findByUser(loginUser)
                .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // 오늘 이미 출근 기록이 있는지 확인
        List<Attendance> existingAttendances = attendanceRepository
                .findByEmployeeAndWorkDate(employee, today);

        if (!existingAttendances.isEmpty()) {
            throw new IllegalArgumentException("오늘은 이미 출근 기록이 있습니다.");
        }

        // 새 근태 기록 생성
        Attendance attendance = Attendance.builder()
                .employee(employee)
                .workDate(today)
                .checkInTime(now)
                .status(AttendanceStatus.NORMAL)
                .notes(notes)
                .build();

        Attendance saved = attendanceRepository.save(attendance);

        return AttendanceResponseDto.from(saved);
    }

    // 퇴근 기록
    @Transactional
    public AttendanceResponseDto checkOut(User loginUser) {
        Employee employee = employeeRepository.findByUser(loginUser)
                .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // 오늘 출근 기록 찾기
        List<Attendance> todayAttendances = attendanceRepository
                .findByEmployeeAndWorkDate(employee, today);

        if (todayAttendances.isEmpty()) {
            throw new IllegalArgumentException("오늘 출근 기록이 없습니다. 먼저 출근해주세요.");
        }

        Attendance attendance = todayAttendances.get(0);

        // 이미 퇴근했는지 확인
        if (attendance.getCheckOutTime() != null) {
            throw new IllegalArgumentException("이미 퇴근 처리되었습니다.");
        }

        // 퇴근 기록 및 근태 상태 자동 계산
        attendance.checkOut(now);

        return AttendanceResponseDto.from(attendance);
    }

    // 오늘 근태 조회
    public AttendanceResponseDto getTodayAttendance(User loginUser) {
        Employee employee = employeeRepository.findByUser(loginUser)
                .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));

        LocalDate today = LocalDate.now();

        List<Attendance> todayAttendances = attendanceRepository
                .findByEmployeeAndWorkDate(employee, today);

        if (todayAttendances.isEmpty()) {
            return null;  // 오늘 기록 없음
        }

        return AttendanceResponseDto.from(todayAttendances.get(0));
    }

    // 관리자용: 전체 사원 근태 이력 조회
    @Transactional(readOnly = true)
    public List<AttendanceResponseDto> getAllAttendance() {
        List<Attendance> attendances = attendanceRepository.findAll();

        return attendances.stream()
                .map(AttendanceResponseDto::from)
                .collect(Collectors.toList());
    }
}