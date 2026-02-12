package com.teamproject.workhub.dto.request;

import com.teamproject.workhub.entity.request.RequestType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RequestDto {
    private RequestType type;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
}
