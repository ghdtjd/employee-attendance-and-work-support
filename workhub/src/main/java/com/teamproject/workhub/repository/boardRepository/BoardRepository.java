package com.teamproject.workhub.repository.boardRepository;

import com.teamproject.workhub.entity.boardEntity.Board;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardRepository extends JpaRepository<Board, Long> {
}
