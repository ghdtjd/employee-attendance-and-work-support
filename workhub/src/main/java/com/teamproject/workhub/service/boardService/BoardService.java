package com.teamproject.workhub.service.boardService;

import com.teamproject.workhub.dto.boardDto.BoardRequestDTO;
import com.teamproject.workhub.dto.boardDto.BoardResponseDTO;
import com.teamproject.workhub.entity.boardEntity.Board;
import com.teamproject.workhub.entity.employeeEntity.Employee;
import com.teamproject.workhub.entity.userEntity.Role;
import com.teamproject.workhub.repository.EmployeeRepository.EmployeeRepository;
import com.teamproject.workhub.repository.boardRepository.BoardRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final EmployeeRepository employeeRepository;


    @Transactional
    public Board createNotice(BoardRequestDTO dto, Long CurrentUser) throws Exception {

        Employee employee  = employeeRepository.findById(CurrentUser)
                .orElseThrow(() -> new RuntimeException("직원 정보를 찾을 수 없습니다." + dto.getEmployeeId()));



        if(employee.getRole() != Role.ADMIN) {
            throw new Exception("관리자만 게시글 작성이 가능합니다.");
        }



        // 2. Notice 생성



        Board board = Board.builder()
                .employeeId(employee)
                .title(dto.getTitle())
                .content(dto.getContent())
                .importance(dto.getImportance())

                .build();
        // 3. 저장
        return boardRepository.save(board);

    }


    // 게시글 전체 조회

    public List<BoardResponseDTO> getAllBoards() {

        List<Board> boards = boardRepository.findAllByOrderByCreatedAtDesc();


        return boards.stream()
                .map(BoardResponseDTO::new)
                .collect(Collectors.toList());


    }


    // 게시글 상세 조회
    public BoardResponseDTO getBoardDetail(Long id){
        Board board = boardRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("게시글을 찾을 수 없습니다."));


        BoardResponseDTO dto = new BoardResponseDTO();


        dto.setNoticeId(board.getId());
        dto.setTitle(board.getTitle());
        dto.setContent(board.getContent());
        dto.setImportance(board.getImportance());
        dto.setCreatedAt(board.getCreatedAt());
        dto.setPosition(board.getEmployeeId().getPosition());
        dto.setEmployeeId();

            return dto;
    }




}
