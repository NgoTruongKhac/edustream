package com.example.edustream.controller;

import com.example.edustream.dto.request.NotificationRequestDto;
import com.example.edustream.dto.response.NotificationResponseDto;
import com.example.edustream.dto.response.PageResponse;
import com.example.edustream.entity.UserPrincipal;
import com.example.edustream.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<NotificationResponseDto> createNotification(
            @RequestBody NotificationRequestDto notificationRequestDto) {
        return ResponseEntity.ok(notificationService.createNotification(notificationRequestDto));
    }

    @GetMapping
    public ResponseEntity<PageResponse<NotificationResponseDto>> getNotificationsByUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userPrincipal));
    }

    @PatchMapping
    public ResponseEntity<?> markAllReadNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        notificationService.markAllReadNotifications(userPrincipal);
        return ResponseEntity.ok(Map.of("message", "update all notifications are read"));
    }

    @GetMapping("/un-read/count")
    public ResponseEntity<?> getNumberUnreadNotifications( @AuthenticationPrincipal UserPrincipal userPrincipal) {
        int count = notificationService.getNumberUnreadNotifications(userPrincipal);
        return ResponseEntity.ok(Map.of("numberUnreadNotifications", count));
    }
}
