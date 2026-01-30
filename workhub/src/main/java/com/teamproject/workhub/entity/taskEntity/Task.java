package com.teamproject.workhub.entity.taskEntity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employeeId")
    private Long employeeId;

    @Column(name = "UserId")
    private Long userId;

    @Column(name = "departNo")
    private Long departNo;

    @Column(length = 255)
    private String title;

    @Column(length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private TaskStatus status;

    private Integer priority;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = TaskStatus.TODO;
        }
    }

    public void updateStatus(TaskStatus newStatus) {
        this.status = newStatus;
    }
}
