package com.teamproject.workhub.entity.employeeEntity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.teamproject.workhub.entity.DepartmentEntity.Department;
import com.teamproject.workhub.entity.userEntity.Role;
import com.teamproject.workhub.entity.userEntity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employeeId")
    private Long employeeId;

    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id", nullable = false)
    private User user;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "manager_id" })
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departNo")
    private Department department;

    @Column(name = "employeeNo", nullable = false, unique = true)
    private String employeeNo;

    @Column(nullable = false)
    private String name;

    private String email;

    private String phone;

    @Column(name = "position")
    private String position;

    @Column(name = "join_date")
    private LocalDate joinDate;

    @Column(name = "resignation_date")
    private LocalDate resignationDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @Column(name = "total_leave")
    private Double totalLeave = 15.0;

    @Builder.Default
    @Column(name = "used_leave")
    private Double usedLeave = 0.0;

    public void updateMyInfo(String email, String phone) {
        if (email != null && !email.isBlank()) {
            this.email = email;
        }
        if (phone != null && !phone.isBlank()) {
            this.phone = phone;
        }
    }
}
