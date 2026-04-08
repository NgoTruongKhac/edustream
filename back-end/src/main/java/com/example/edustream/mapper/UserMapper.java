package com.example.edustream.mapper;

import com.example.edustream.dto.request.RegisterRequestDto;
import com.example.edustream.dto.response.UserResponseDto;
import com.example.edustream.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
	
	 UserResponseDto toUserResponseDto(User user);
	 
	 User toUser(RegisterRequestDto registerRequestDto);
	 User toUser(UserResponseDto userResponseDto);
}
