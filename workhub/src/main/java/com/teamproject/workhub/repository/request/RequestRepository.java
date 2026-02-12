package com.teamproject.workhub.repository.request;

import com.teamproject.workhub.entity.request.Request;
import com.teamproject.workhub.entity.userEntity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    List<Request> findByUserOrderByCreatedAtDesc(User user);
}
