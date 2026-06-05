package com.example.edustream.controller;

import com.example.edustream.dto.request.*;
import com.example.edustream.dto.response.PageResponse;
import com.example.edustream.dto.response.VideoResponseDto;
import com.example.edustream.dto.response.VideoUploadResponseDto;
import com.example.edustream.entity.UserPrincipal;
import com.example.edustream.service.VideoService;
import com.example.edustream.service.VideoViewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;
    private final VideoViewService videoViewService;

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
    public ResponseEntity<VideoResponseDto> getVideoById(
            @PathVariable Long videoId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) { // Thêm dòng này

        VideoResponseDto response = videoService.getVideoById(videoId, userPrincipal);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/all")
    public ResponseEntity<PageResponse<VideoResponseDto>> getAllVideos(
            @RequestParam(value = "page", defaultValue = "0") int page) {

        // Gọi service xử lý logic
        PageResponse<VideoResponseDto> response = videoService.getAllVideos(page);

        // Trả về dữ liệu kèm theo status 200 OK
        return ResponseEntity.ok(response);
    }

    // Đã đổi endpoint thành /category để tránh lỗi Ambiguous mapping với getVideosByCurrentUser()
    @GetMapping("/category")
    public ResponseEntity<PageResponse<VideoResponseDto>> getVideosByCategory(
            @RequestParam String category,
            @RequestParam(value = "page", defaultValue = "0") int page) {

        // Gọi service xử lý logic
        PageResponse<VideoResponseDto> response = videoService.getVideosByCategory(category, page);

        // Trả về dữ liệu kèm theo status 200 OK
        return ResponseEntity.ok(response);
    }
    @GetMapping("/filter") // Đổi tên endpoint cho mang tính tổng quát
    public ResponseEntity<PageResponse<VideoResponseDto>> filterVideos(
            @Valid @ModelAttribute VideoFilterRequestDto filterDto) {

        PageResponse<VideoResponseDto> response = videoService.filterVideos(filterDto);
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
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVideoByVideoId(
            @PathVariable long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        videoService.deleteVideoById(id, userPrincipal);
        return ResponseEntity.noContent().build();
    }
    // Thêm endpoint vào VideoController
    @PutMapping("/{videoId}")
    public ResponseEntity<VideoUploadResponseDto> updateVideo(
            @PathVariable Long videoId,
            @Valid @RequestBody VideoUpdateRequestDto requestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        VideoUploadResponseDto response = videoService.updateVideo(videoId, requestDto, userPrincipal);

        return ResponseEntity.ok(response);
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{videoId}/accept")
    public ResponseEntity<Void> acceptVideo(@PathVariable Long videoId) {
        videoService.acceptVideo(videoId);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{videoId}/reject")
    public ResponseEntity<Void> rejectVideo(
            @PathVariable Long videoId,
            @Valid @RequestBody ViolationRequestDto violationRequestDto) {

        // Đảm bảo videoId lấy từ URL đồng bộ với dữ liệu trong DTO gửi sang service
        violationRequestDto.setVideoId(videoId);

        videoService.rejectVideo(violationRequestDto);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/{id}/related")
    public ResponseEntity<PageResponse<VideoResponseDto>> getRelatedVideos(
            @PathVariable("id") Long videoId,
            @RequestParam(defaultValue = "0") int page) {

        PageResponse<VideoResponseDto> response = videoService.getRelatedVideos(videoId, page);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/view-event")
    public ResponseEntity<String> recordVideoView(@RequestBody VideoViewRequestDto requestDto) {
        System.out.println("call");
        boolean isNewView = videoViewService.processViewEvent(requestDto);
        System.out.println(isNewView);
        if (isNewView) {
            return ResponseEntity.ok("View event accepted");
        }
        return ResponseEntity.ok("Spam detected or view already counted within 24h");
    }
    @PatchMapping("/{videoId}/like")
    public ResponseEntity<VideoResponseDto> likeVideo(
            @PathVariable Long videoId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) { // Thêm dòng này

        VideoResponseDto responseDto = videoService.toggleLikeVideo(videoId, userPrincipal);
        return ResponseEntity.ok(responseDto);
    }
    @GetMapping("/search")
    public ResponseEntity<PageResponse<VideoResponseDto>> searchVideos(
            @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page) {

        PageResponse<VideoResponseDto> response = videoService.searchVideos(keyword, page);

        return ResponseEntity.ok(response);
    }
}
