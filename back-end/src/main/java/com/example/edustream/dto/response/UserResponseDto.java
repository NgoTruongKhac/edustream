package com.example.edustream.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserResponseDto {
	
	
	private Long id;
	private String fullName;
	private String username;
	private String email;
	private String avatar;
	private String authProvider;
	private String providerId;

}
