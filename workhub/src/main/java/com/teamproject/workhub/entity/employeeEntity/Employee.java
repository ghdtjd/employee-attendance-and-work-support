package com.teamproject.workhub.entity.employeeEntity;


import com.teamproject.workhub.entity.DepartmentEntity.Department;
import com.teamproject.workhub.entity.userEntity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "departNo")
    private  Department department;

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




}
