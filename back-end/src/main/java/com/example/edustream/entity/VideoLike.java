package com.example.edustream.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "video_likes",
        uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "video_id"})}) // Đảm bảo cặp user-video không bị trùng lặp
@Getter
@Setter
@NoArgsConstructor
public class VideoLike extends AbstractEntity<VideoLike> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    public VideoLike(User user, Video video) {
        this.user = user;
        this.video = video;
    }
}