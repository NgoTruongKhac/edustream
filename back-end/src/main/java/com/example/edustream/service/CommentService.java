package com.example.edustream.service;

import com.example.edustream.dto.request.CommentRequestDto;
import com.example.edustream.dto.request.LikeCommentRequestDto;
import com.example.edustream.dto.request.NotificationRequestDto;
import com.example.edustream.dto.request.ReplyCommentRequestDto;
import com.example.edustream.dto.response.CommentResponseDto;
import com.example.edustream.dto.response.NotificationResponseDto;
import com.example.edustream.dto.response.PageResponse;
import com.example.edustream.entity.*;
import com.example.edustream.entity.enums.NotificationType;
import com.example.edustream.exception.ResourceNotFoundException;
import com.example.edustream.mapper.CommentMapper;
import com.example.edustream.repository.CommentLikeRepository;
import com.example.edustream.repository.CommentRepository;
import com.example.edustream.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
    private final NotificationService notificationService;
    private final OnlineUserService onlineUserService;
    private final SimpMessagingTemplate messagingTemplate;

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

        // Gửi Notification cho chủ Video
        // Chỉ gửi nếu người comment không phải là chủ video
        if (!video.getUser().getId().equals(currentUser.getId())) {
            sendInteractionNotification(
                    currentUser,
                    video.getUser().getId(),
                    video.getId(),
                    NotificationType.COMMENT,
                    currentUser.getFullName() + " đã bình luận trong video: " + video.getTitle()
            );
        }

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

        // Gửi Notification cho chủ của bình luận gốc
        if (!parentComment.getUser().getId().equals(currentUser.getId())) {
            sendInteractionNotification(
                    currentUser,
                    parentComment.getUser().getId(),
                    video.getId(),
                    NotificationType.REPLY_COMMENT,
                    currentUser.getFullName() + " đã trả lời bình luận của bạn trong video: " + video.getTitle()
            );
        }

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

            // Gửi Notification LIKE cho chủ của comment
            // Lưu ý: referenceId ở đây vẫn là videoId để user click vào thông báo sẽ dẫn tới video
            if (!comment.getUser().getId().equals(currentUser.getId())) {
                sendInteractionNotification(
                        currentUser,
                        comment.getUser().getId(),
                        comment.getVideo().getId(),
                        NotificationType.LIKE,
                        currentUser.getFullName() + " đã thích bình luận của bạn trong video: " + comment.getVideo().getTitle()
                );
            }
        }
    }

    /**
     * Hàm helper dùng chung để gửi notification qua DB và Socket
     */
    private void sendInteractionNotification(User sender, Long recipientId, Long videoId, NotificationType type, String message) {
        // 1. Tạo notification trong DB thông qua NotificationService
        NotificationRequestDto notifDto = new NotificationRequestDto();
        notifDto.setSenderId(sender.getId());
        notifDto.setRecipientId(recipientId);
        notifDto.setReferenceId(videoId);
        notifDto.setNotificationType(type);
        notifDto.setMessage(message);

        NotificationResponseDto notificationResponse = notificationService.createNotification(notifDto);

        // 2. Gửi Real-time qua WebSocket nếu recipient online
        if (onlineUserService.isOnline(recipientId)) {
            messagingTemplate.convertAndSend(
                    "/topic/notification/" + recipientId,
                    notificationResponse
            );
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<CommentResponseDto> getComments(Long videoId, int page) {
        videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Video"));

        return new PageResponse<>(commentRepository.findByVideoIdAndParentIsNullOrderByCreatedAtDesc(
                videoId, PageRequest.of(page, 10)).map(commentMapper::toCommentResponseDto));
    }

    @Transactional(readOnly = true)
    public PageResponse<CommentResponseDto> getRepliesByCommentId(Long commentId, int page) {
        // Kiểm tra comment cha tồn tại
        commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Bình luận gốc không tồn tại"));

        Pageable pageable = PageRequest.of(page, 5); // Thường reply load mỗi lần 5 cái
        Page<Comment> replyPage = commentRepository.findByParentIdOrderByCreatedAtAsc(commentId, pageable);

        return new PageResponse<>(replyPage.map(commentMapper::toCommentResponseDto));
    }
}