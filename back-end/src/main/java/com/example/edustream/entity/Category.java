package com.example.edustream.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "categories")
@Getter
@Setter
public class Category extends AbstractEntity<Category>{

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "slug_name")
    private String slugName;

    @ManyToMany(mappedBy = "categories")
    private Set<Video> videos = new HashSet<>();

}
