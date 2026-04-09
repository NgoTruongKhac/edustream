package com.example.edustream.controller;

import com.example.edustream.dto.request.UserUpdateRequestDto;
import com.example.edustream.dto.response.PageResponse;
import com.example.edustream.dto.response.UserResponseDto;
import com.example.edustream.entity.UserPrincipal;
import com.example.edustream.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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

        PageResponse<UserResponseDto> response=new PageResponse<>(data);

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
    @PutMapping
    public ResponseEntity<UserResponseDto> updateUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UserUpdateRequestDto userUpdateRequestDto) {

        UserResponseDto response = userService.updateUser(userPrincipal, userUpdateRequestDto);
        return ResponseEntity.ok(response);
    }
}