package com.teamproject.workhub.dto.boardDto;


import com.teamproject.workhub.entity.boardEntity.Importance;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BoardRequestDTO {
    private Long employeeId;
    private String title;
    private String content;
    private Importance importance;
    private String name;


}
