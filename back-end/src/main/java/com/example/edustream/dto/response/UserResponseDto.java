package com.example.edustream.dto.response;

import com.example.edustream.entity.enums.UserStatus;
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
	private String description;
	private String email;
	private String avatar;
	private String coverImage;
	private String authProvider;
	private String providerId;
	private long subscribersCount;
	private int strikeCount;
	private UserStatus userStatus;

}
