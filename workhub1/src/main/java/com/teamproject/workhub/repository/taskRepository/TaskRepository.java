package com.teamproject.workhub.repository.taskRepository;

import com.teamproject.workhub.entity.taskEntity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
}
