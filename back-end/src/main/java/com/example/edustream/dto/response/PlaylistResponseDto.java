package com.example.edustream.dto.response;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PlaylistResponseDto {
    private String playlistId;
    private String playlistName;
    private String thumbnail;
    private long videoCount;
    private boolean isInPlaylist;
}
