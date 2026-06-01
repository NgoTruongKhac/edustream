package com.example.edustream.service;

import com.example.edustream.dto.request.NotificationRequestDto;
import com.example.edustream.dto.response.NotificationResponseDto;
import com.example.edustream.dto.response.PageResponse;
import com.example.edustream.entity.Notification;
import com.example.edustream.entity.User;
import com.example.edustream.entity.UserPrincipal;
import com.example.edustream.entity.Video;
import com.example.edustream.mapper.NotificationMapper;
import com.example.edustream.repository.NotificationRepository;
import com.example.edustream.repository.UserRepository;
import com.example.edustream.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final UserRepository userRepository;
    private final VideoRepository videoRepository;

    @Transactional
    public NotificationResponseDto createNotification(NotificationRequestDto dto) {
        Notification notification = notificationMapper.toNotification(dto);

        // 1. Kiểm tra và set Recipient (Luôn luôn phải có)
        User recipient = userRepository.getReferenceById(dto.getRecipientId());
        notification.setRecipient(recipient);

        // 2. REFACTOR: Kiểm tra senderId trước khi truy vấn proxy nhằm tránh lỗi Null
        if (dto.getSenderId() != null) {
            User sender = userRepository.getReferenceById(dto.getSenderId());
            notification.setSender(sender);
        } else {
            notification.setSender(null); // Hệ thống gửi thì không có người dùng cụ thể
        }

        Notification saved = notificationRepository.save(notification);

        // 3. REFACTOR: Chỉ load lại chi tiết sender khi senderId tồn tại
        if (dto.getSenderId() != null) {
            saved.setSender(userRepository.findById(dto.getSenderId()).orElseThrow());
        }

        NotificationResponseDto response = notificationMapper.toNotificationResponseDto(saved);

        // 4. Set thumbnail nếu có referenceId
        if (dto.getReferenceId() != null) {
            videoRepository.findById(dto.getReferenceId())
                    .ifPresent(video -> response.setThumbnail(video.getThumbnail()));
        }

        return response;
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponseDto> getNotificationsByUserId(UserPrincipal userPrincipal) {
        Long userId = userPrincipal.getUser().getId();

        // Lấy 10 notifications mới nhất, sender đã được JOIN FETCH
        Pageable pageable = PageRequest.of(0, 10);
        Page<Notification> notificationPage =
                notificationRepository.findTop10ByRecipientId(userId, pageable);

        List<Notification> notifications = notificationPage.getContent();

        // Batch-load videos theo referenceId để tránh N+1
        Set<Long> referenceIds = notifications.stream()
                .map(Notification::getReferenceId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, String> videoThumbnailMap = referenceIds.isEmpty()
                ? Collections.emptyMap()
                : videoRepository.findAllById(referenceIds).stream()
                .collect(Collectors.toMap(
                        video -> video.getId(),
                        Video::getThumbnail
                ));

        // Map sang DTO và set thumbnail
        Page<NotificationResponseDto> responsePage = notificationPage.map(notification -> {
            NotificationResponseDto dto = notificationMapper.toNotificationResponseDto(notification);
            if (notification.getReferenceId() != null) {
                dto.setThumbnail(videoThumbnailMap.get(notification.getReferenceId()));
            }
            return dto;
        });

        return new PageResponse<>(responsePage);
    }

    @Transactional
    public void markAllReadNotifications(UserPrincipal userPrincipal) {
        Long userId = userPrincipal.getUser().getId();
        notificationRepository.markAllAsReadByRecipientId(userId);
    }
    @Transactional(readOnly = true)
    public int getNumberUnreadNotifications(UserPrincipal userPrincipal) {
        Long userId = userPrincipal.getUser().getId();
        return notificationRepository.countUnreadNotifications(userId);
    }
}
