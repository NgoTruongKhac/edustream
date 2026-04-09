package com.example.edustream.controller;

import java.util.HashMap;
import java.util.Map;

import com.example.edustream.dto.request.LoginRequestDto;
import com.example.edustream.dto.request.OtpRequestDto;
import com.example.edustream.dto.request.RegisterRequestDto;
import com.example.edustream.dto.response.TokenResponseDto;
import com.example.edustream.dto.response.UserResponseDto;
import com.example.edustream.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;

	@PostMapping("/register")
	public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDto registerRequestDto) {

		Map<String, String> response = new HashMap<>();

		authService.register(registerRequestDto);

		response.put("message", "otp send to your emal");

		return ResponseEntity.status(200).body(response);

	}

	@PostMapping("/verify-register")
	public ResponseEntity<UserResponseDto> verifyRegister(@RequestBody OtpRequestDto otpRequestDto) {

		UserResponseDto newUser = authService.verifyRegister(otpRequestDto);

		return ResponseEntity.status(201).body(newUser);

	}

	@PostMapping("/login")
	public ResponseEntity<TokenResponseDto> login(@Valid @RequestBody LoginRequestDto loginRequestDto) {

		TokenResponseDto response = authService.authenticate(loginRequestDto);

		return ResponseEntity.status(200).body(response);
	}

	@PostMapping("/refresh-token")
	public ResponseEntity<TokenResponseDto> refreshToken(@CookieValue String refreshToken) {

		TokenResponseDto response = authService.refreshToken(refreshToken);

		return ResponseEntity.status(200).body(response);

	}

}
