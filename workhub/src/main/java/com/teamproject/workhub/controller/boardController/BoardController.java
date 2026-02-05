package com.teamproject.workhub.controller.boardController;


import com.teamproject.workhub.dto.boardDto.BoardRequestDTO;
import com.teamproject.workhub.dto.boardDto.BoardResponseDTO;
import com.teamproject.workhub.entity.employeeEntity.Employee;
import com.teamproject.workhub.entity.userEntity.User;
import com.teamproject.workhub.service.boardService.BoardService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
            @RequestBody BoardRequestDTO dto, HttpServletRequest request
    ) {

        HttpSession session = request.getSession(false);

        if(session == null || session.getAttribute("loginUser") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        User loginUser = (User) session.getAttribute("loginUser");

        try {
            boardService.createNotice(dto, loginUser.getId());
            return ResponseEntity.ok("게시글 등록 완료!");

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());  // "관리자만 등록 가능합니다."
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }



    // 게시글 전체 조회

    @GetMapping("/list")
    public ResponseEntity<List<BoardResponseDTO>> getAllBoards() {
            List<BoardResponseDTO> notices = boardService.getAllBoards();

            return ResponseEntity.ok(notices);
    }


    // 게시글 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<BoardResponseDTO> getDetail(@PathVariable Long id) {

        BoardResponseDTO response = boardService.getBoardDetail(id);

        return ResponseEntity.ok(response);
    }


}
