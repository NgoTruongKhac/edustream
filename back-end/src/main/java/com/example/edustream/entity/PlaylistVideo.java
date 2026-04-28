package com.example.edustream.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "playlist_videos",
        uniqueConstraints = @UniqueConstraint(columnNames = {"playlist_id", "video_id"})
)
@Getter
@Setter
public class PlaylistVideo extends AbstractEntity<PlaylistVideo>{

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "playlist_id", nullable = false)
    private Playlist playlist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

}
