package com.example.edustream.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LoginRequestDto {

	@Email(message = "email is invalid")
	@NotBlank(message = "email is required")
	private String email;

	@NotBlank(message = "password is required")
	@Size(min = 3, max=12, message = "password is length from 3 to 12 characters")
	private String password;

}
