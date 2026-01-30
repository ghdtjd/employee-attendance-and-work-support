package com.teamproject.workhub.repository.userRepository;

import com.teamproject.workhub.entity.userEntity.User;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmployeeNo(String employeeNo);

    boolean existsByEmployeeNo(String employeeNo);

    // 비밀번호 초기화 설정




}
