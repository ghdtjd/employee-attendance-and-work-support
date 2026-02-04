package com.teamproject.workhub.repository.boardRepository;

import com.teamproject.workhub.dto.noticeDto.NoticeResponseDTO;
import com.teamproject.workhub.entity.boardEntity.Board;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findAllByOrderByCreatedAtDesc();



}
