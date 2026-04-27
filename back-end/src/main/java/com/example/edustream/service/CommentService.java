package com.example.edustream.service;

import com.example.edustream.dto.request.CommentRequestDto;
import com.example.edustream.dto.request.LikeCommentRequestDto;
import com.example.edustream.dto.request.ReplyCommentRequestDto;
import com.example.edustream.dto.response.CommentResponseDto;
import com.example.edustream.dto.response.PageResponse;
import com.example.edustream.entity.*;
import com.example.edustream.mapper.CommentMapper;
import com.example.edustream.repository.CommentLikeRepository;
import com.example.edustream.repository.CommentRepository;
import com.example.edustream.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final VideoRepository videoRepository;
    private final CommentMapper commentMapper; // Inject CommentMapper

    // 1. CREATE COMMENT (Bình luận gốc)
    @Transactional
    public CommentResponseDto createComment(UserPrincipal userPrincipal, CommentRequestDto dto) {
        User currentUser = userPrincipal.getUser();

        Video video = videoRepository.findById(dto.getVideoId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Video"));

        Comment comment = new Comment();
        comment.setContent(dto.getContent());
        comment.setVideo(video);
        comment.setUser(currentUser);

        Comment savedComment = commentRepository.save(comment);

        // Sử dụng Mapper thay cho hàm thủ công
        return commentMapper.toCommentResponseDto(savedComment);
    }

    // 2. REPLY COMMENT (Trả lời bình luận)
    @Transactional
    public CommentResponseDto replyComment(UserPrincipal userPrincipal, ReplyCommentRequestDto dto) {
        User currentUser = userPrincipal.getUser();

        Video video = videoRepository.findById(dto.getVideoId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Video"));

        Comment parentComment = commentRepository.findById(dto.getParentId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bình luận gốc"));

        Comment reply = new Comment();
        reply.setContent(dto.getContent());
        reply.setVideo(video);
        reply.setUser(currentUser);
        reply.setParent(parentComment);

        Comment savedReply = commentRepository.save(reply);

        parentComment.setReplyCount(parentComment.getReplyCount() + 1);
        commentRepository.save(parentComment);

        // Sử dụng Mapper
        return commentMapper.toCommentResponseDto(savedReply);
    }

    // 3. LIKE / UNLIKE COMMENT (Toggle Like)
    @Transactional
    public void likeComment(UserPrincipal userPrincipal, LikeCommentRequestDto dto) {
        User currentUser = userPrincipal.getUser();

        Comment comment = commentRepository.findById(dto.getCommentId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bình luận"));

        Optional<CommentLike> existingLike = commentLikeRepository.findByCommentAndUser(comment, currentUser);

        if (existingLike.isPresent()) {
            commentLikeRepository.delete(existingLike.get());
            comment.setLikeCount(Math.max(0, comment.getLikeCount() - 1));
        } else {
            CommentLike newLike = new CommentLike();
            newLike.setComment(comment);
            newLike.setUser(currentUser);
            commentLikeRepository.save(newLike);
            comment.setLikeCount(comment.getLikeCount() + 1);
        }
    }
    @Transactional(readOnly = true) // Tối ưu hiệu suất cho tác vụ chỉ đọc
    public PageResponse<CommentResponseDto> getComments(Long videoId, int page) {
        // Kiểm tra xem video có tồn tại không (Tuỳ chọn, nhưng giúp trả về lỗi rõ ràng hơn)
        videoRepository.findById(videoId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Video"));

        int pageSize = 10;
        Pageable pageable = PageRequest.of(page, pageSize);

        // Lấy danh sách comment gốc từ Database
        Page<Comment> commentPage = commentRepository.findByVideoIdAndParentIsNullOrderByCreatedAtDesc(videoId, pageable);

        // Chuyển đổi từ Entity sang Dto bằng MapStruct
        Page<CommentResponseDto> dtoPage = commentPage.map(commentMapper::toCommentResponseDto);

        // Trả về wrapper PageResponse của bạn
        return new PageResponse<>(dtoPage);
    }
}