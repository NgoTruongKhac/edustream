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
public class RegisterRequestDto {


	@NotBlank(message = "full name is required")
	@Size(min = 3, max = 20, message = "full name length from 3 to 10 characters")
	private String fullName;

	@Email(message = "email is invalid")
	@NotBlank(message = "email is required")
	private String email;

	@NotBlank(message = "password is required")
	@Size(min = 6, message = "password length must be at least 6 characters")
	private String password;

}
