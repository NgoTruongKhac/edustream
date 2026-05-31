package com.example.edustream.mapper;

import com.example.edustream.dto.request.VideoUploadRequestDto;
import com.example.edustream.dto.request.VideoYoutubeRequestDto;
import com.example.edustream.dto.response.VideoResponseDto;
import com.example.edustream.entity.Category;
import com.example.edustream.entity.Hashtag;
import com.example.edustream.entity.Video;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface VideoMapper {

    // --- Chiều 1: Map từ Request DTO sang Entity (Ghi dữ liệu) ---
    // Cần ignore categories và hashtags vì chúng ta xử lý logic này tại Service
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "categories", ignore = true) // <--- QUAN TRỌNG
    @Mapping(target = "hashtags", ignore = true)   // <--- QUAN TRỌNG
    @Mapping(target = "videoType", constant = "YOUTUBE")
    @Mapping(target = "uploadStatus", constant = "PUBLISHED")
    Video toVideo(VideoYoutubeRequestDto request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "categories", ignore = true) // <--- QUAN TRỌNG
    @Mapping(target = "hashtags", ignore = true)   // <--- QUAN TRỌNG
    @Mapping(target = "videoType", constant = "UPLOAD")
    @Mapping(target = "uploadStatus", constant = "PENDING")
    Video toVideo(VideoUploadRequestDto request);

    // --- Chiều 2: Map từ Entity sang Response DTO (Đọc dữ liệu) ---
    // Helper methods (giữ nguyên logic của bạn)
    @Mapping(target = "fullName", source = "user.fullName")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "avatar", source = "user.avatar")
    @Mapping(target = "subscribersCount", source = "user.subscribersCount")
    // Sử dụng parameter 'video' để khớp với tham số truyền vào
    @Mapping(target = "categories", expression = "java(mapCategories(video.getCategories()))")
    @Mapping(target = "hashtags", expression = "java(mapHashtags(video.getHashtags()))")
    VideoResponseDto toVideoResponseDto(Video video);
    default List<String> mapCategories(Set<Category> categories) {
        if (categories == null) return null;
        return categories.stream()
                .map(Category::getCategoryName)
                .collect(Collectors.toList());
    }

    default List<String> mapHashtags(Set<Hashtag> hashtags) {
        if (hashtags == null) return null;
        return hashtags.stream()
                .map(Hashtag::getHashtagName)
                .collect(Collectors.toList());
    }
}