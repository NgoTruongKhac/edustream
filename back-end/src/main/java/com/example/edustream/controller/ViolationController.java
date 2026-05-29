package com.example.edustream.controller;

import com.example.edustream.dto.request.ViolationRequestDto;
import com.example.edustream.dto.response.ViolationResponseDto;
import com.example.edustream.entity.Violation;
import com.example.edustream.mapper.ViolationMapper;
import com.example.edustream.service.ViolationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/violations")
@RequiredArgsConstructor
public class ViolationController {

    private final ViolationService violationService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ViolationResponseDto> createViolation(@RequestBody ViolationRequestDto violationRequestDto) {
        return ResponseEntity.ok(violationService.createViolation(violationRequestDto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/block/{userId}")
    public ResponseEntity<String> blockUser(@PathVariable Long userId) {
        violationService.blockUser(userId);
        return ResponseEntity.ok("User has been blocked successfully.");
    }
}
