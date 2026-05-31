package com.example.edustream.dto.request;

import com.example.edustream.entity.enums.ReportStatus;
import com.example.edustream.entity.enums.ViolationType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportRequestDto {
    Long userId;
    Long videoId;
    ViolationType  violationType;
    String description;
}
