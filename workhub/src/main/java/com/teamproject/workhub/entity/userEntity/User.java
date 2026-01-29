package com.teamproject.workhub.entity.userEntity;

import jakarta.persistence.*;
import lombok.*;
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String employeeNo;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private Role role;

    @Column(name = "is_active")
    private boolean isActive;

    @Column(name = "must_change_password")
    private boolean mustChangepassword = true;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;


    public void updateLastLogin() {
        this.lastLogin = LocalDateTime.now();
    }


}
