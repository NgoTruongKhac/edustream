package com.example.edustream.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "comments")
@Getter
@Setter
public class Comment extends AbstractEntity<Comment> {

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // VIDEO
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    // USER
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // SELF JOIN (reply)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Comment parent;

    // Đếm sẵn để tối ưu performance
    @Column(name = "like_count")
    private long likeCount = 0;

    @Column(name = "reply_count")
    private long replyCount = 0;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
}