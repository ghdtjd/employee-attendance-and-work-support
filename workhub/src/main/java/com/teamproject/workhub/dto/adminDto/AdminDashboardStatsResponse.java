package com.teamproject.workhub.dto.adminDto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminDashboardStatsResponse {
    private long totalEmployees;
    private long todayAttendanceCount;
    private long pendingCorrectionsCount;
    private double attendanceRate;
}
