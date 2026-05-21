package com.example.edustream.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "hashtags")
@Getter
@Setter
public class Hashtag extends AbstractEntity<Hashtag>{
    @Column(name = "hashtag_name")
    private String hashtagName;

    @ManyToMany(mappedBy = "hashtags")
    private Set<Video> videos = new HashSet<>();

}

