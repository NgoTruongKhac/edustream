package com.example.edustream.mapper;

import com.example.edustream.dto.request.NotificationRequestDto;
import com.example.edustream.dto.response.NotificationResponseDto;
import com.example.edustream.entity.Notification;
import com.example.edustream.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface NotificationMapper {

    // Map từ DTO sang Entity (dùng cho createNotification)
    // sender/recipient sẽ được set thủ công trong service
    @Mapping(target = "sender", ignore = true)
    @Mapping(target = "recipient", ignore = true)
    @Mapping(target = "type", source = "notificationType")
    Notification toNotification(NotificationRequestDto notificationRequestDto);

    // Map từ Entity sang ResponseDto (fullName, avatar từ sender)
    @Mapping(target = "fullName", source = "sender.fullName")
    @Mapping(target = "avatar", source = "sender.avatar")
    @Mapping(target = "thumbnail", ignore = true) // set thủ công từ Video
    NotificationResponseDto toNotificationResponseDto(Notification notification);
}