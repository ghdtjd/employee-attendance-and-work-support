package com.teamproject.workhub.controller.boardController;


import com.teamproject.workhub.dto.noticeDto.NoticeRequestDTO;
import com.teamproject.workhub.dto.noticeDto.NoticeResponseDTO;
import com.teamproject.workhub.service.boardService.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/board")
@RequiredArgsConstructor
public class BoardController {


    private final BoardService boardService;



    @PostMapping("/add")
    public ResponseEntity<String> createBoard(
            @RequestBody NoticeRequestDTO dto
    ) {



        boardService.createNotice(dto);
        return ResponseEntity.ok("게시글 등록 완료!");
    }



    // 게시글 전체 조회

    @GetMapping("/list")
    public ResponseEntity<List<NoticeResponseDTO>> getAllBoards() {
            List<NoticeResponseDTO> notices = boardService.getAllBoards();

            return ResponseEntity.ok(notices);
    }


}
