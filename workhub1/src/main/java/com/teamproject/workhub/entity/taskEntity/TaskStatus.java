package com.teamproject.workhub.entity.taskEntity;

public enum TaskStatus {TODO("未着手"),
    IN_PROGRESS("進行中"),
    DONE("完了");

    private final String description;

    TaskStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
