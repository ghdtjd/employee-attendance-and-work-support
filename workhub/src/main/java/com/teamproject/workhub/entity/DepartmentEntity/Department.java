package com.teamproject.workhub.entity.DepartmentEntity;


import com.teamproject.workhub.entity.employeeEntity.Employee;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name= "department")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "departNo")
    private Long departNo;

    @Column(nullable = false)
    private String departName;

    @Column(nullable = false)
    private String departTel;

    @Column(nullable = false)
    private String departMail;

    @Column(nullable = false)
    private String departLocation;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager_id;




}
