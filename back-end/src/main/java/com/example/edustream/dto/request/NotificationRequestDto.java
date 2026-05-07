package com.example.edustream.dto.request;

import com.example.edustream.entity.enums.NotificationType;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class NotificationRequestDto {
    private Long senderId;
    private Long recipientId;
    private Long referenceId;
    private NotificationType notificationType;
    private String message;
}
