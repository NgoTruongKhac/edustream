package com.example.edustream.mapper;

import com.example.edustream.dto.request.RegisterRequestDto;
import com.example.edustream.dto.request.UserUpdateRequestDto;
import com.example.edustream.dto.response.UserResponseDto;
import com.example.edustream.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE )
public interface UserMapper {

    UserResponseDto toUserResponseDto(User user);

    User toUser(RegisterRequestDto registerRequestDto);

    void updateUser(@MappingTarget User user, UserUpdateRequestDto dto);
}
