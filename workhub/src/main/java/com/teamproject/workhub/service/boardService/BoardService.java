package com.teamproject.workhub.service.boardService;

import com.teamproject.workhub.dto.noticeDto.NoticeRequestDTO;
import com.teamproject.workhub.entity.boardEntity.Board;
import com.teamproject.workhub.entity.employeeEntity.Employee;
import com.teamproject.workhub.repository.EmployeeRepository.EmployeeRepository;
import com.teamproject.workhub.repository.boardRepository.BoardRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final EmployeeRepository employeeRepository;


    @Transactional
    public void createNotice(NoticeRequestDTO dto) {
        // 1. 로그인한 사용자의 Employee 찾기
        Employee employee = employeeRepository.findByName(dto.getName())
                .orElseThrow(() -> new RuntimeException("직원 정보를 찾을 수 없습니다."));

        // 2. Notice 생성
        Board board = Board.builder()
                .employee(employee)
                .title(dto.getTitle())
                .content(dto.getContent())
                .importance(dto.getImportance())
                .build();

        // 3. 저장
        Board saved = boardRepository.save(board);


    }

}
