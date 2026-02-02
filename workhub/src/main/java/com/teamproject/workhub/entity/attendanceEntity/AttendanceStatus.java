package com.teamproject.workhub.entity.attendanceEntity;

public enum AttendanceStatus {
    NORMAL("정상"),
    LATE("지각"),
    EARLY_LEAVE("조퇴"),
    ABSENT("결근"),
    VACATION("휴가"),
    SICK_LEAVE("병가"),
    BUSINESS_TRIP("출장");

    private final String description;

    AttendanceStatus (String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
