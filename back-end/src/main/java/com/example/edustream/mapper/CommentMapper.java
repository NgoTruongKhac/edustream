package com.example.edustream.mapper;

import com.example.edustream.dto.response.CommentResponseDto;
import com.example.edustream.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface CommentMapper {

    @Mapping(source = "user.fullName", target = "fullName")
    @Mapping(source = "user.username", target = "username")
    @Mapping(source = "user.avatar", target = "avatar")
    CommentResponseDto toCommentResponseDto(Comment comment);
}