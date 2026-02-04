package com.teamproject.workhub.dto.noticeDto;


import com.teamproject.workhub.entity.boardEntity.Importance;
import com.teamproject.workhub.entity.employeeEntity.Employee;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NoticeRequestDTO {
    private Long employeeId;
    private String title;
    private String content;
    private Importance importance;
    private String name;


}
