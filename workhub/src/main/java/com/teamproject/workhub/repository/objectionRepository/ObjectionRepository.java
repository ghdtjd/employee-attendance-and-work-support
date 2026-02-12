package com.teamproject.workhub.repository.objectionRepository;

import com.teamproject.workhub.entity.objectionRequest.ObjectionRequest;
import com.teamproject.workhub.entity.objectionRequest.ObjectionStatus;
import com.teamproject.workhub.entity.userEntity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ObjectionRepository extends JpaRepository<ObjectionRequest, Long> {
    List<ObjectionRequest> findByUser(User user);

    List<ObjectionRequest> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<ObjectionRequest> findByUserIdAndStatus(Long userId, ObjectionStatus status);

    long countByStatus(ObjectionStatus status);
}
