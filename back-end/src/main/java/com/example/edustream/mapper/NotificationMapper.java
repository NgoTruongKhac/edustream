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

    @Mapping(target = "sender", ignore = true)
    @Mapping(target = "recipient", ignore = true)
    @Mapping(target = "type", source = "notificationType")
    Notification toNotification(NotificationRequestDto notificationRequestDto);

    @Mapping(target = "fullName", source = "sender.fullName")
    @Mapping(target = "avatar", source = "sender.avatar")
    @Mapping(target = "thumbnail", ignore = true)
    NotificationResponseDto toNotificationResponseDto(Notification notification);
}