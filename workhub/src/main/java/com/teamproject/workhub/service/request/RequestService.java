package com.teamproject.workhub.service.request;

import com.teamproject.workhub.dto.request.RequestDto;
import com.teamproject.workhub.entity.request.Request;
import com.teamproject.workhub.entity.request.RequestStatus;
import com.teamproject.workhub.entity.userEntity.User;
import com.teamproject.workhub.repository.request.RequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RequestService {
    @Autowired
    private RequestRepository repository;

    @Transactional
    public Request submitRequest(User user, RequestDto dto) {
        Request request = Request.builder()
                .user(user)
                .type(dto.getType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .status(RequestStatus.PENDING)
                .build();
        return repository.save(request);
    }

    public List<Request> getMyRequests(User user) {
        return repository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public void cancelRequest(Long id, User user) {
        Request request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        if (!request.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized");
        }
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be cancelled");
        }
        repository.delete(request);
    }

    public List<Request> getAllRequests() {
        return repository.findAll();
    }

    @Transactional
    public Request updateStatus(Long id, RequestStatus status) {
        Request request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(status);
        return repository.save(request);
    }
}
