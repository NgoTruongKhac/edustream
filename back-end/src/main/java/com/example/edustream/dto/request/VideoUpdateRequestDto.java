package com.example.edustream.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class VideoUpdateRequestDto {
    private String title;
    private String description;
    private String thumbnailFileName;
    private String thumbnailContentType;
    private String category;
    private List<String> hashtags;
    private List<String> categories;
}
