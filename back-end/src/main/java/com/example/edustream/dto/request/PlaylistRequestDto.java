package com.example.edustream.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PlaylistRequestDto {
    @NotBlank(message = "playlist name is required")
    @Size(min = 2,  max = 30, message = "playlist name invalid (2-30 characters)")
    private String playlistName;
}
