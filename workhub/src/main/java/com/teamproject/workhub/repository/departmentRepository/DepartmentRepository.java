package com.teamproject.workhub.repository.departmentRepository;

import com.teamproject.workhub.entity.DepartmentEntity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Long, Department> {


}
