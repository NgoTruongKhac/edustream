package com.example.edustream.dto.response;

import com.example.edustream.entity.enums.ViolationType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ViolationResponseDto {
    String username;
    String avatar;
    String title;
    String thumbnail;
    ViolationType violationType;
    String reason;
}
