package com.example.edustream.service;

import com.example.edustream.dto.request.NotificationRequestDto;
import com.example.edustream.dto.request.ViolationRequestDto;
import com.example.edustream.dto.response.NotificationResponseDto;
import com.example.edustream.dto.response.ViolationResponseDto;
import com.example.edustream.entity.User;
import com.example.edustream.entity.Video;
import com.example.edustream.entity.Violation;
import com.example.edustream.entity.enums.NotificationType;
import com.example.edustream.entity.enums.UserStatus;
import com.example.edustream.entity.enums.ViolationType;
import com.example.edustream.exception.ResourceNotFoundException;
import com.example.edustream.mapper.ViolationMapper;
import com.example.edustream.repository.UserRepository;
import com.example.edustream.repository.VideoRepository;
import com.example.edustream.repository.ViolationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ViolationService {

    private final ViolationRepository violationRepository;
    private final UserRepository userRepository;
    private final VideoRepository videoRepository;
    private final ViolationMapper violationMapper;
    private final NotificationService notificationService;
    private final OnlineUserService onlineUserService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public ViolationResponseDto createViolation(ViolationRequestDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Video video = null;
        if (dto.getVideoId() != null) {
            video = videoRepository.findById(dto.getVideoId()).orElse(null);
        }

        Violation violation = new Violation();
        violation.setUser(user);
        violation.setVideo(video);
        violation.setViolationType(dto.getViolationType());
        violation.setReason(dto.getReason());
        violation.setStrikeCount(1);
        violation = violationRepository.save(violation);

        user.setStrikeCount(user.getStrikeCount() + 1);

        if (user.getStrikeCount() >= 3) {
            blockUserLogic(user);
        }
        userRepository.save(user);

        sendViolationNotification(user, dto.getViolationType(), video);

        return violationMapper.toViolationResponseDto(violation);
    }

    @Transactional
    public void blockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        blockUserLogic(user);
        userRepository.save(user);
    }

    private void blockUserLogic(User user) {
        user.setUserStatus(UserStatus.BLOCKED);
    }

    private void sendViolationNotification(User recipient, ViolationType type, Video video) {
        String message = "Hệ thống cảnh báo: " + type.toString();

        NotificationRequestDto notifDto = new NotificationRequestDto();
        notifDto.setRecipientId(recipient.getId());
        notifDto.setSenderId(null); // Hệ thống gửi
        notifDto.setReferenceId(video.getId());
        notifDto.setNotificationType(NotificationType.SYSTEM);
        notifDto.setMessage(message);

        NotificationResponseDto response = notificationService.createNotification(notifDto);

        if (onlineUserService.isOnline(recipient.getId())) {
            messagingTemplate.convertAndSend(
                    "/topic/notification/" + recipient.getId(),
                    response
            );
        }
    }
}