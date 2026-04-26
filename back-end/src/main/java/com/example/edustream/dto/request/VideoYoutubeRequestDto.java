package com.example.edustream.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class VideoYoutubeRequestDto {
    @NotBlank(message = "title is require")
    @Size()
    private String title;

    @Size
    private String description;

    private String thumbnail;

    private long duration;

    private String videoYoutubeUrl;
    private String videoYoutubeId;

    private List<String> hashtags;
    private List<String> categories;


}
