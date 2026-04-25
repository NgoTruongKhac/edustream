package com.example.edustream.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "categories")
@Getter
@Setter
public class Category extends AbstractEntity<Category>{

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "slug_name")
    private String slugName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

}
