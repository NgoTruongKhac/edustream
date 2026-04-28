package com.example.edustream.mapper;

import com.example.edustream.dto.request.PlaylistRequestDto;
import com.example.edustream.dto.response.PlaylistResponseDto;
import com.example.edustream.entity.Playlist;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PlaylistMapper {

    @Mapping(target = "playlistId", expression = "java(playlist.getId() == null ? null : String.valueOf(playlist.getId()))")
    @Mapping(target = "thumbnail", ignore = true)
    @Mapping(target = "videoCount", ignore = true)
    PlaylistResponseDto toPlaylistResponseDto(Playlist playlist);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    Playlist toPlaylist(PlaylistRequestDto playlistRequestDto);
}