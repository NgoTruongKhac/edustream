package com.example.edustream.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "playlists")
@Setter
@Getter
public class Playlist extends AbstractEntity<Playlist>{

    @Column(name = "playlist_name")
    private String playlistName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

}
