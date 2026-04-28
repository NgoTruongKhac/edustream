package com.example.edustream.dto.response;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PlayListVideoResponseDto {
    private String playlistId;
    private String playlistName;
    private VideoResponseDto  videoResponseDto;
}
