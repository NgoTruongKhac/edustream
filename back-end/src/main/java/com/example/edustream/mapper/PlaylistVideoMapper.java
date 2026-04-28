package com.example.edustream.mapper;

import com.example.edustream.dto.request.PlaylistVideoRequestDto;
import com.example.edustream.dto.response.PlayListVideoResponseDto;
import com.example.edustream.entity.PlaylistVideo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = {VideoMapper.class}, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PlaylistVideoMapper {

    @Mapping(target = "playlistId", expression = "java(playlistVideo.getPlaylist().getId() == null ? null : String.valueOf(playlistVideo.getPlaylist().getId()))")
    @Mapping(target = "playlistName", source = "playlist.playlistName")
    @Mapping(target = "videoResponseDto", source = "video")
    PlayListVideoResponseDto toPlaylistVideoResponseDto(PlaylistVideo playlistVideo);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "playlist", ignore = true)
    @Mapping(target = "video", ignore = true)
    PlaylistVideo toPlaylistVideo(PlaylistVideoRequestDto playlistVideoRequestDto);
}