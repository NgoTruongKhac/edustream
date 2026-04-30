package com.example.edustream.controller;

import com.example.edustream.dto.request.VideoUploadRequestDto;
import com.example.edustream.dto.request.VideoYoutubeRequestDto;
import com.example.edustream.dto.response.PageResponse;
import com.example.edustream.dto.response.VideoResponseDto;
import com.example.edustream.dto.response.VideoUploadResponseDto;
import com.example.edustream.entity.UserPrincipal;
import com.example.edustream.service.VideoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;

    @PostMapping("/youtube")
    public ResponseEntity<VideoResponseDto> createVideoYoutube(
            @Valid @RequestBody VideoYoutubeRequestDto videoYoutubeRequestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        VideoResponseDto responseDto = videoService.createVideoYoutube(videoYoutubeRequestDto, userPrincipal);

        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }
    @GetMapping()
    public ResponseEntity<PageResponse<VideoResponseDto>> getVideosByCurrentUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "page", defaultValue = "0") int page) {

        PageResponse<VideoResponseDto> response = videoService.getVideosByCurrentUser(userPrincipal, page);

        return ResponseEntity.ok(response);
    }
    @GetMapping("/{username}")
    public ResponseEntity<PageResponse<VideoResponseDto>> getVideosByUsername(
            @PathVariable String username,
            @RequestParam(value = "page", defaultValue = "0") int page) {

        // Gọi service xử lý logic
        PageResponse<VideoResponseDto> response = videoService.getVideosByUsername(username, page);

        // Trả về dữ liệu kèm theo status 200 OK
        return ResponseEntity.ok(response);
    }
    @GetMapping("/watch/{videoId}")
    public ResponseEntity<VideoResponseDto> getVideoById(@PathVariable Long videoId) {

        // Gọi service để lấy dữ liệu
        VideoResponseDto response = videoService.getVideoById(videoId);

        // Trả về dữ liệu kèm theo status 200 OK
        return ResponseEntity.ok(response);
    }
    // Nhớ import các class DTO mới tạo
    @PostMapping("/upload")
    public ResponseEntity<VideoUploadResponseDto> requestUploadUrl(
            @Valid @RequestBody VideoUploadRequestDto requestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        VideoUploadResponseDto response = videoService.createVideoUpload(requestDto, userPrincipal);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    @PatchMapping("/{videoId}/confirm")
    public ResponseEntity<VideoResponseDto> confirmVideoUpload(
            @PathVariable Long videoId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        // Gọi service để cập nhật trạng thái
        VideoResponseDto responseDto = videoService.confirmVideoUpload(videoId, userPrincipal);

        // Trả về dữ liệu kèm theo status 200 OK
        return ResponseEntity.ok(responseDto);
    }
}
