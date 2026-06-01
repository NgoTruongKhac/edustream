package com.example.edustream.dto.response;

import com.example.edustream.entity.enums.ReportStatus;
import com.example.edustream.entity.enums.ViolationType;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class ReportResponseDto {
    Long id;
    Long userId;
    Long videoId;
    String avatar;
    String fullName;
    String username;
    String title;
    String thumbnail;
    ViolationType violationType;
    ReportStatus reportStatus;
    String description;
    Instant createdAt;
}
