package com.example.edustream.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Setter
@Getter
public class NotificationResponseDto {
    private String fullName;
    private String avatar;
    private String thumbnail;
    private String message;
    private Long referenceId;
    private Instant createdAt;

}
