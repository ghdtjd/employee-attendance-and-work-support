package com.teamproject.workhub.entity.userEntity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String emplyoeeNo;

    @Column(nullable = false)
    private String password1;

    @Column(nullable = false)
    private Role role;

    @Column(name = "is_active")
    private boolean isActive;

    @Column(name = "must_change_password")
    private boolean mustChangepassword = true;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;






}
