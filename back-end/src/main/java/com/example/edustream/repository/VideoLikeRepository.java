package com.example.edustream.repository;

import com.example.edustream.entity.VideoLike;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VideoLikeRepository extends JpaRepository<VideoLike, Long> {
    // Kiểm tra xem User đã like Video này chưa
    Optional<VideoLike> findByUserIdAndVideoId(Long userId, Long videoId);

    // Kiểm tra nhanh tồn tại (dùng để trả về trạng thái cho Frontend)
    boolean existsByUserIdAndVideoId(Long userId, Long videoId);
}