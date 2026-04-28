package com.example.edustream.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Service;

@Getter
@Setter
public class PlaylistVideoRequestDto {

    @NotNull(message = "playlistId is required")
    private Long playlistId;

    @NotNull(message = "videoId is required")
    private Long videoId;
}
