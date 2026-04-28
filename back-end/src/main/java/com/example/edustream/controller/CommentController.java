package com.example.edustream.controller;

import com.example.edustream.dto.request.CommentRequestDto;
import com.example.edustream.dto.request.LikeCommentRequestDto;
import com.example.edustream.dto.request.ReplyCommentRequestDto;
import com.example.edustream.dto.response.CommentResponseDto;
import com.example.edustream.dto.response.PageResponse;
import com.example.edustream.entity.UserPrincipal;
import com.example.edustream.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // API tạo bình luận gốc
    @PostMapping
    public ResponseEntity<CommentResponseDto> createComment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CommentRequestDto dto) {

        CommentResponseDto response = commentService.createComment(userPrincipal, dto);
        return ResponseEntity.ok(response);
    }

    // API trả lời bình luận
    @PostMapping("/reply")
    public ResponseEntity<CommentResponseDto> replyComment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ReplyCommentRequestDto dto) {

        CommentResponseDto response = commentService.replyComment(userPrincipal, dto);
        return ResponseEntity.ok(response);
    }

    // API Like / Unlike bình luận
    @PostMapping("/like")
    public ResponseEntity<?> likeComment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody LikeCommentRequestDto dto) {

        commentService.likeComment(userPrincipal, dto);
        return ResponseEntity.ok(Map.of("message", "Thao tác thành công"));
    }

    @GetMapping("/{videoId}")
    public ResponseEntity<PageResponse<CommentResponseDto>> getComments(
            @PathVariable Long videoId,
            @RequestParam(defaultValue = "0") int page) {

        PageResponse<CommentResponseDto> response = commentService.getComments(videoId, page);

        return ResponseEntity.ok(response);
    }
}