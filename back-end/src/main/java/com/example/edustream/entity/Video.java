package com.example.edustream.entity;

import com.example.edustream.entity.enums.UploadStatus;
import com.example.edustream.entity.enums.VideoStatus;
import com.example.edustream.entity.enums.VideoType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

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

    @Column(name = "view")
    private long view=0;

    @Column(name = "like_count")
    private long likeCount=0;


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
    private VideoStatus videoStatus=VideoStatus.PENDING;

    @Column(name = "upload_status")
    @Enumerated(EnumType.STRING)
    private UploadStatus uploadStatus;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "video_categories",
            joinColumns = @JoinColumn(name = "video_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "video_hashtags",
            joinColumns = @JoinColumn(name = "video_id"),
            inverseJoinColumns = @JoinColumn(name = "hashtag_id")
    )
    private Set<Hashtag> hashtags = new HashSet<>();
}
