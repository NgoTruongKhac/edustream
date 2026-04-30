package com.example.edustream.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class VideoUploadResponseDto {
    private VideoResponseDto videoInfo;
    private String presignedUrl;
    private String thumbnailPresignedUrl;
}