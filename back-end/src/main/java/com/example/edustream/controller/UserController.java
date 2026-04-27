package com.example.edustream.controller;

import com.example.edustream.dto.request.ChangeEmailRequestDto;
import com.example.edustream.dto.request.OtpRequestDto;
import com.example.edustream.dto.request.UserUpdateRequestDto;
import com.example.edustream.dto.response.PageResponse;
import com.example.edustream.dto.response.UserResponseDto;
import com.example.edustream.entity.UserPrincipal;
import com.example.edustream.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;


@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/v1/users/me
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        UserResponseDto response = userService.getMe(userPrincipal);
        return ResponseEntity.ok(response);
    }

    // GET /api/v1/users?page=0
    @GetMapping
    public ResponseEntity<PageResponse<UserResponseDto>> getAllUsers(@RequestParam(defaultValue = "0") int page) {

        Page<UserResponseDto> data = userService.getAllUsers(page);

        PageResponse<UserResponseDto> response = new PageResponse<>(data);

        return ResponseEntity.ok(response);
    }

    // GET /api/v1/users/{username}
    @GetMapping("/{username}")
    public ResponseEntity<UserResponseDto> getUserByUsername(
            @PathVariable String username) {

        UserResponseDto response = userService.getUserByUsername(username);
        return ResponseEntity.ok(response);
    }

    // PUT /api/v1/users
    @PatchMapping
    public ResponseEntity<UserResponseDto> updateUser(@Valid @RequestBody UserUpdateRequestDto userUpdateRequestDto,
                                                      @AuthenticationPrincipal UserPrincipal userPrincipal) {

        UserResponseDto response = userService.updateUser(userPrincipal, userUpdateRequestDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload-cover-image")
    public ResponseEntity<UserResponseDto> uploadCoverImage(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("coverImage") MultipartFile coverImage) {  // @RequestParam để nhận multipart

        UserResponseDto response = userService.updateCoverImage(userPrincipal, coverImage);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload-avatar")
    public ResponseEntity<UserResponseDto> uploadAvatar(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("avatar") MultipartFile avatar) {

        UserResponseDto response = userService.updateAvatar(userPrincipal, avatar);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/change-email")
    public ResponseEntity<?> changeEmail(@Valid @RequestBody ChangeEmailRequestDto changeEmailRequestDto) {
        userService.changeEmail(changeEmailRequestDto);

        // Trả về JSON: {"message": "otp sent to your email"}
        return ResponseEntity.ok(Map.of("message", "otp sent to your email"));
    }

    @PostMapping("/verify-change-email")
    public ResponseEntity<UserResponseDto> verifyChangeEmail(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody OtpRequestDto otpRequestDto) {

        UserResponseDto response = userService.verifyChangeEmail(userPrincipal, otpRequestDto);
        return ResponseEntity.ok(response);
    }
}