package com.example.edustream.dto.request;

import com.example.edustream.entity.enums.ViolationStatus;
import com.example.edustream.entity.enums.ViolationType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ViolationRequestDto {
    Long userId;
    Long videoId;
    ViolationType violationType;
    String reason;
}
