package com.teamproject.workhub.repository.attendanceRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.teamproject.workhub.entity.attendanceEntity.Attendance;
import com.teamproject.workhub.entity.attendanceEntity.AttendanceStatus;
import com.teamproject.workhub.entity.employeeEntity.Employee;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
        // 특정 사원의 모든 근태 이력 조회 (최신순)
        List<Attendance> findByEmployeeOrderByWorkDateDesc(Employee employee);

        // 특정 사원의 특정 기간 근태 조회
        List<Attendance> findByEmployeeAndWorkDateBetweenOrderByWorkDateDesc(
                        Employee employee, LocalDate startDate, LocalDate endDate);

        // 특정 사원의 특정 상태 근태 조회
        List<Attendance> findByEmployeeAndStatusOrderByWorkDateDesc(
                        Employee employee, AttendanceStatus status);

        // 특정 사원의 특정 날짜 근태 조회
        List<Attendance> findByEmployeeAndWorkDate(Employee employee, LocalDate workDate);

        // 특정 사원의 특정 월 근태 조회
        List<Attendance> findByEmployeeAndWorkDateBetween(
                        Employee employee, LocalDate startOfMonth, LocalDate endOfMonth);

        long countByWorkDate(LocalDate workDate);
}
