package com.teamproject.workhub.entity.objectionRequest;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.teamproject.workhub.entity.userEntity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "objection_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class ObjectionRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "attendanceDate")
    private LocalDate attendanceDate;

    private String category;
    private String reason;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ObjectionStatus status = ObjectionStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
