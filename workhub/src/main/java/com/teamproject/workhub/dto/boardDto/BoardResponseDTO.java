package com.teamproject.workhub.dto.boardDto;

import com.teamproject.workhub.entity.boardEntity.Board;
import com.teamproject.workhub.entity.boardEntity.Importance;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
public class BoardResponseDTO {

    // 게시글 작성
    private Long noticeId;
    private Long employeeId;
    private String position;
    private String title;
    private String content;
    private Importance importance;
    private LocalDateTime createdAt;

    public BoardResponseDTO(Board board) {
        this.noticeId = board.getId();
        this.title = board.getTitle();
        this.content = board.getContent();
        this.importance = board.getImportance();
        this.createdAt = board.getCreatedAt();

        if (board.getEmployeeId() != null) {
            this.employeeId = board.getEmployeeId().getEmployeeId();
            this.position = board.getEmployeeId().getPosition();
        }

    }

}
