package com.example.edustream.entity;

import com.example.edustream.entity.enums.VideoStatus;
import com.example.edustream.entity.enums.VideoType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "videos")
@Getter
@Setter
public class Video extends AbstractEntity<Video> {

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "thumbnail")
    private String thumbnail;

    @Column(name = "duration")
    private long duration;

    @Column(name = "video_type")
    @Enumerated(EnumType.STRING)
    private VideoType videoType;

    @Column(name = "video_url")
    private String videoUrl;

    @Column(name = "video_youtube_url")
    private String videoYoutubeUrl;

    @Column(name = "video_youtube_id")
    private String videoYoutubeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "video_status")
    @Enumerated(EnumType.STRING)
    private VideoStatus videoStatus;

}
