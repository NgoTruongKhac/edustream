package com.example.edustream.dto.request;

import lombok.Data;

@Data
public class VideoViewRequestDto {
    private Long videoId;
    private String userIdentifier; // Có thể là userId (nếu đăng nhập) hoặc IP/Fingerprint (nếu không đăng nhập)
}