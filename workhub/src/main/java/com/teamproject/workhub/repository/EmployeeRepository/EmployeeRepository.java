package com.teamproject.workhub.repository.EmployeeRepository;

import com.teamproject.workhub.entity.employeeEntity.Employee;
import com.teamproject.workhub.entity.userEntity.Role;
import com.teamproject.workhub.entity.userEntity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByUser(User user);

    Optional<Employee> findByEmployeeNo(String employeeNo);

    Optional<Employee> findByName(String name);

    @Query("SELECT e FROM Employee e WHERE e.user.id = :userId")
    Optional<Employee> findByUserId(@Param("userId") Long userId);
}
