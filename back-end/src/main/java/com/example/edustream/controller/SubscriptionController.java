package com.example.edustream.controller;

import com.example.edustream.dto.request.SubscribeRequestDto;
import com.example.edustream.dto.response.PageResponse;
import com.example.edustream.dto.response.UserResponseDto;
import com.example.edustream.entity.UserPrincipal;
import com.example.edustream.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/subscribe")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping()
    public ResponseEntity<?> subscribe(
            @Valid @RequestBody SubscribeRequestDto subscribeRequestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        subscriptionService.subscribe(userPrincipal, subscribeRequestDto);

        return ResponseEntity.ok(Map.of("message", "subscribe successful"));
    }
    @DeleteMapping()
    public ResponseEntity<?> unsubscribe(
            @Valid @RequestBody SubscribeRequestDto subscribeRequestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        subscriptionService.unsubscribe(userPrincipal, subscribeRequestDto);

        return ResponseEntity.ok(Map.of("message", "unsubscribe successful"));
    }
    @GetMapping("/check/{username}")
    public ResponseEntity<Map<String, Boolean>> checkSubscription(
            @PathVariable String username,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        boolean isSubscribed = subscriptionService.checkSubscription(userPrincipal, username);

        return ResponseEntity.ok(Map.of("isSubscribed", isSubscribed));
    }

    @GetMapping()
    public ResponseEntity<PageResponse<UserResponseDto>> getSubscriptions(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page) {

        PageResponse<UserResponseDto> response = subscriptionService.getSubscriptions(userPrincipal, page);

        return ResponseEntity.ok(response);
    }


}