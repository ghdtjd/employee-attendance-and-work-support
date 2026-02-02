package com.teamproject.workhub.dto.noticeDto;


import com.teamproject.workhub.entity.boardEntity.Importance;
import com.teamproject.workhub.entity.userEntity.Role;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
public class NoticeResponseDTO {

    // 게시글 작성
    private Long noticeId;
    private String title;
    private String content;
    private Importance importance;
    private LocalDateTime createdAt;
    private String name;



}
