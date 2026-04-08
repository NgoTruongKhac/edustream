package com.example.edustream.service;

import java.util.Random;

import com.example.edustream.dto.request.LoginRequestDto;
import com.example.edustream.dto.request.OtpRequestDto;
import com.example.edustream.dto.request.RegisterRequestDto;
import com.example.edustream.dto.response.TokenResponseDto;
import com.example.edustream.dto.response.UserResponseDto;
import com.example.edustream.entity.User;
import com.example.edustream.entity.enums.AuthProvider;
import com.example.edustream.entity.enums.Role;
import com.example.edustream.exception.EmailAlreadyExistsException;
import com.example.edustream.exception.ExpiredOtpException;
import com.example.edustream.exception.NotMatchingOtpException;
import com.example.edustream.exception.NotMatchingRefreshTokenException;
import com.example.edustream.mapper.UserMapper;
import com.example.edustream.repository.UserRepository;
import com.example.edustream.security.jwt.JwtAuthenticationService;
import com.example.edustream.util.SendEmail;
import com.example.edustream.util.StringUtil;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

	private final UserRepository userRepository;
	private final SendEmail sendEmail;
	private final PasswordEncoder passwordEncoder;
	private final HttpSession session;
	private final UserMapper userMapper;
	private final AuthenticationManager authenticationManager;
	private final JwtAuthenticationService jwtService;
	private final UserDetailService userDetailService;

	private static final int OTP_EXP = 5;

	@Transactional
	public void register(RegisterRequestDto registerRequestDto) {

		// check exist email
		if (userRepository.findByEmailAndAuthProvider(registerRequestDto.getEmail(), AuthProvider.DEFAULT).isPresent()) {
			throw new EmailAlreadyExistsException("Email already exists");
		}
		// generate random OTP (6 numbers)

		Random random = new Random();

		int otpValue = 100000 + random.nextInt(900000);
		String otp = String.valueOf(otpValue);

		// send email with otp to registerRequestDto.getEmail()

		sendEmail.sendOtpToEmail(registerRequestDto.getEmail(), otp);

		// save session include requestDto and OTP and exp OTP

		session.setAttribute("register_request", registerRequestDto);
		session.setAttribute("otp", otp);
		session.setAttribute("otp_exp", System.currentTimeMillis() + OTP_EXP * 60 * 1000);

	}

	@Transactional
	public UserResponseDto verifyRegister(OtpRequestDto otpRequestDto) {

		String sessionOtp = (String) session.getAttribute("otp");
		Long otpExp = (Long) session.getAttribute("otp_exp");
		RegisterRequestDto registerRequestDto = (RegisterRequestDto) session.getAttribute("register_request");

		// 1. Kiểm tra OTP
		if (sessionOtp == null || !sessionOtp.equals(otpRequestDto.getOtp())) {
			throw new NotMatchingOtpException("Invalid OTP code");
		}

		// 2. Kiểm tra hết hạn
		if (System.currentTimeMillis() > otpExp) {
			throw new ExpiredOtpException("OTP has expired. Please request a new one.");
		}

		// 3. Mapping và tạo thông tin User
		User newUser = userMapper.toUser(registerRequestDto);

		// 4. Logic tạo Handle Name Unique
		String uniqueUsername = generateUniqueHandle(registerRequestDto.getFullName());
		newUser.setUsername(uniqueUsername);

		newUser.setPassword(passwordEncoder.encode(registerRequestDto.getPassword()));
		newUser.setRole(Role.CUSTOMER);
		newUser.setAuthProvider(AuthProvider.DEFAULT);

		User userSaved = userRepository.save(newUser);
		clearSession();

		return userMapper.toUserResponseDto(userSaved);
	}

	private String generateUniqueHandle(String username) {
		String baseHandle = StringUtil.toBaseHandle(username);
		String finalHandle = baseHandle;
		int counter = 1;

		while (userRepository.existsByUsername(finalHandle)) {
			finalHandle = baseHandle + counter;
			counter++;
		}

		return finalHandle;
	}

	public TokenResponseDto authenticate(LoginRequestDto loginRequestDto) {

		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(loginRequestDto.getEmail(), loginRequestDto.getPassword()));

		UserDetails userDetails = (UserDetails) authentication.getPrincipal();

		String accessToken = jwtService.generateToken(userDetails);
		String refreshToken = jwtService.generateRefreshToken(userDetails);

		return new TokenResponseDto(accessToken, refreshToken);

	}

	public TokenResponseDto refreshToken(String refreshToken) {

		String userEmail = jwtService.extractUsername(refreshToken);

		UserDetails userDetails = userDetailService.loadUserByUsername(userEmail);

		if (!jwtService.isTokenValid(refreshToken, userDetails)) {
			throw new NotMatchingRefreshTokenException("refresh token not maching");
		}

		String newAccessToken = jwtService.generateToken(userDetails);

		return new TokenResponseDto(newAccessToken, refreshToken);

	}

	private void clearSession() {
		// TODO Auto-generated method stub

		session.removeAttribute("otp");
		session.removeAttribute("register_request");
		session.removeAttribute("otp_exp");

	}

}
