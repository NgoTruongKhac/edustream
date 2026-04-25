package com.example.edustream.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "hashtags")
@Getter
@Setter
public class Hashtag extends AbstractEntity<Hashtag>{
    @Column(name = "hashtag_name")
    private String hashtagName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

}

