package com.teamproject.workhub.entity.userEntity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.jspecify.annotations.Nullable;

import java.time.LocalDateTime;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 이 부분을 확인하세요!
    private Long id;

    @Column(nullable = false, unique = true)
    private String employeeNo;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "is_active")
    private boolean isActive;

    @Column(name = "must_change_password")
    private boolean mustChangePassword = true;

    @Column(name = "last_login")
    private LocalDateTime lastLoign;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void updateLastLogin(){
        this.lastLoign = LocalDateTime.now();
    }


    public void changePassword(String newPassword){
        this.password = newPassword;
    }

}