package com.example.edustream.mapper;

import com.example.edustream.dto.request.VideoYoutubeRequestDto;
import com.example.edustream.dto.response.VideoResponseDto;
import com.example.edustream.entity.Video;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface VideoMapper {

    // Map từ Request DTO sang Entity
    @Mapping(target = "id", ignore = true) // Bỏ qua id vì tự tăng
    @Mapping(target = "user", ignore = true) // Sẽ được set thủ công từ UserPrincipal
    @Mapping(target = "videoType", constant = "YOUTUBE") // Mặc định type là YOUTUBE
    Video toVideo(VideoYoutubeRequestDto request);

    // Map từ Entity sang Response DTO
    @Mapping(source = "user.fullName", target = "fullName")
    @Mapping(source = "user.username", target = "username")
    @Mapping(source = "user.avatar", target = "avatar")
    VideoResponseDto toVideoResponseDto(Video video);
}