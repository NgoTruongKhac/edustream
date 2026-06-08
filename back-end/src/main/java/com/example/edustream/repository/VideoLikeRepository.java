package com.example.edustream.repository;

import com.example.edustream.entity.VideoLike;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VideoLikeRepository extends JpaRepository<VideoLike, Long> {
    Optional<VideoLike> findByUserIdAndVideoId(Long userId, Long videoId);

    boolean existsByUserIdAndVideoId(Long userId, Long videoId);
}