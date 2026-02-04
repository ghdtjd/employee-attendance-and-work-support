package com.teamproject.workhub.service.boardService;

import com.teamproject.workhub.dto.noticeDto.NoticeRequestDTO;
import com.teamproject.workhub.dto.noticeDto.NoticeResponseDTO;
import com.teamproject.workhub.entity.boardEntity.Board;
import com.teamproject.workhub.entity.employeeEntity.Employee;
import com.teamproject.workhub.repository.EmployeeRepository.EmployeeRepository;
import com.teamproject.workhub.repository.boardRepository.BoardRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.hibernate.action.internal.EntityActionVetoException;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final EmployeeRepository employeeRepository;


    @Transactional
    public void createNotice(@RequestBody  NoticeRequestDTO dto) {

        Employee employee = employeeRepository.findById(dto.getEmployeeId()).orElseThrow(() -> new RuntimeException("직원 정보를 찾을 수 없습니다." + dto.getEmployeeId()));

        // 2. Notice 생성
        Board board = Board.builder()
                .employeeId(employee)
                .title(dto.getTitle())
                .content(dto.getContent())
                .importance(dto.getImportance())
                .build();

        // 3. 저장
        Board saved = boardRepository.save(board);


    }


    // 게시글 전체 조회

    public List<NoticeResponseDTO> getAllBoards() {

        List<Board> boards = boardRepository.findAllByOrderByCreatedAtDesc();


        return boards.stream()
                .map(NoticeResponseDTO::new)
                .collect(Collectors.toList());


    }


    // 게시글 상세 조회
    public NoticeResponseDTO getBoardDetail(Long id){
        Board board = boardRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("게시글을 찾을 수 없습니다."));


        NoticeResponseDTO dto = new NoticeResponseDTO();

        dto.setNoticeId(board.getId());
        dto.setTitle(board.getTitle());
        dto.setContent(board.getContent());
        dto.setImportance(board.getImportance());
        dto.setCreatedAt(board.getCreatedAt());
        dto.setPosition(board.getEmployeeId().getPosition());

            return dto;
    }


}
