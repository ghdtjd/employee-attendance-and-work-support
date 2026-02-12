package com.teamproject.workhub.service.objectionService;

import com.teamproject.workhub.controller.objectionController.ObjectionRequestDto;
import com.teamproject.workhub.entity.objectionRequest.ObjectionRequest;
import com.teamproject.workhub.entity.objectionRequest.ObjectionStatus;
import com.teamproject.workhub.entity.userEntity.User;
import com.teamproject.workhub.repository.objectionRepository.ObjectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ObjectionService {
    @Autowired
    private ObjectionRepository repository;

    public ObjectionRequest submitObjection(User user, ObjectionRequestDto dto) {
        ObjectionRequest request = new ObjectionRequest();
        request.setUser(user);
        request.setAttendanceDate(dto.getAttendanceDate());
        request.setCategory(dto.getCategory());
        request.setReason(dto.getReason());
        request.setStatus(ObjectionStatus.PENDING);
        return repository.save(request);
    }

    public List<ObjectionRequest> getMyObjections(User user) {
        return repository.findByUser(user);
    }

    public void cancelObjection(Long id, User user) {
        ObjectionRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Not authorized");
        }

        repository.delete(request);
    }

    public List<ObjectionRequest> getAllObjections() {
        return repository.findAll();
    }

    public ObjectionRequest updateStatus(Long id, ObjectionStatus status) {
        ObjectionRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(status);
        return repository.save(request);
    }
}