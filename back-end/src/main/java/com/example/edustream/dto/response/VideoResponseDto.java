package com.example.edustream.dto.response;

import com.example.edustream.entity.enums.VideoType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Setter
@Getter
@AllArgsConstructor
public class VideoResponseDto {
    private String id;
    private String title;
    private String thumbnail;
    private String description;
    private long duration;
    private VideoType videoType;
    private String videoYoutubeUrl;
    private String videoYoutubeId;
    private String fullName;
    private String username;
    private String avatar;
    private Instant createdAt;

}
