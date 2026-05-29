package com.example.edustream.mapper;

import com.example.edustream.dto.response.ViolationResponseDto;
import com.example.edustream.entity.Violation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ViolationMapper {

    @Mapping(source = "user.username", target = "username")
    @Mapping(source = "user.avatar", target = "avatar")
    @Mapping(source = "video.title", target = "title")
    @Mapping(source = "video.thumbnail", target = "thumbnail")
    ViolationResponseDto toViolationResponseDto(Violation violation);

    Violation toViolation(ViolationResponseDto violationResponseDto);
}