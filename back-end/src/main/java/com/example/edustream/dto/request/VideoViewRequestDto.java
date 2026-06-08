package com.example.edustream.dto.request;

import lombok.Data;

@Data
public class VideoViewRequestDto {
    private Long videoId;
    private String userIdentifier;
}