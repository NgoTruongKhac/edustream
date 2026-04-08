package com.example.edustream.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class RegisterRequestDto {


	private String fullName;
	private String email;
	private String password;

}
