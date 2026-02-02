package com.teamproject.workhub.entity.attendanceEntity;

import com.teamproject.workhub.entity.employeeEntity.Employee;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employeeId", nullable = false)
    private Employee employee;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;  // 근무 날짜

    @Column(name = "check_in_time")
    private LocalTime checkInTime;  // 출근 시간

    @Column(name = "check_out_time")
    private LocalTime checkOutTime;  // 퇴근 시간

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AttendanceStatus status;  // 근태 상태

    @Column(name = "notes")
    private String notes;  // 비고 (사유 등)

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 근무 시간 계산 (시간 단위)
    public Double getWorkHours() {
        if (checkInTime == null || checkOutTime == null) {
            return 0.0;
        }
        long minutes = java.time.Duration.between(checkInTime, checkOutTime).toMinutes();
        return minutes / 60.0;
    }

    // 출근 기록
    public void checkIn(LocalTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    // 퇴근 기록 및 근태 상태 자동 계산
    public void checkOut(LocalTime checkOutTime) {
        this.checkOutTime = checkOutTime;
        this.updatedAt = LocalDateTime.now();
        this.status = calculateAttendanceStatus();
    }

    // 근태 상태 자동 계산
    private AttendanceStatus calculateAttendanceStatus() {
        if (checkInTime == null) {
            return AttendanceStatus.ABSENT;
        }
        LocalTime normalStartTime = LocalTime.of(9, 0);
        if (checkInTime.isAfter(normalStartTime)) {
            return AttendanceStatus.LATE;
        }
        if (checkOutTime != null) {
            LocalTime normalEndTime = LocalTime.of(18, 0);
            if (checkOutTime.isBefore(normalEndTime)) {
                return AttendanceStatus.EARLY_LEAVE;
            }
        }
        return AttendanceStatus.NORMAL;
    }

    // 비고 수정
    public void updateNotes(String notes) {
        this.notes = notes;
        this.updatedAt = LocalDateTime.now();
    }
}