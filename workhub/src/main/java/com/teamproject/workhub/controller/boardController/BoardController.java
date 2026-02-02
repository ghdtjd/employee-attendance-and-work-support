package com.teamproject.workhub.controller.boardController;


import com.teamproject.workhub.dto.noticeDto.NoticeRequestDTO;
import com.teamproject.workhub.service.boardService.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/board")
@RequiredArgsConstructor
public class BoardController {


    private BoardService boardService;



    @PostMapping("/add")
    public ResponseEntity<String> createBoard(
            @RequestBody NoticeRequestDTO dto

            ) {
        boardService.createNotice(dto);
        return ResponseEntity.ok("게시글 등록 완료!");
    }

}
