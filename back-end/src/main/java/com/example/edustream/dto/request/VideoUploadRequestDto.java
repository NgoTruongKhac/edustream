package com.example.edustream.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class VideoUploadRequestDto {
    private String title;
    private String description;
    private String fileName;
    private String contentType;
    private String thumbnailFileName;
    private String thumbnailContentType;
    private List<String> hashtags;
    private List<String> categories;
}