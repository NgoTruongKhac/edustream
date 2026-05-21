package com.example.edustream.repository;

import com.example.edustream.entity.User;
import com.example.edustream.entity.Video;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {

    // Fetch dữ liệu liên quan để tránh LazyInitializationException
    @Query("SELECT DISTINCT v FROM Video v " +
            "LEFT JOIN FETCH v.categories " +
            "LEFT JOIN FETCH v.hashtags " +
            "WHERE v.user = :user")
    Page<Video> findByUser(@Param("user") User user, Pageable pageable);

    @Query("SELECT DISTINCT v FROM Video v " +
            "LEFT JOIN FETCH v.categories " +
            "LEFT JOIN FETCH v.hashtags " +
            "WHERE v.user.username = :username")
    Page<Video> findByUser_Username(@Param("username") String username, Pageable pageable);

    @Query("SELECT DISTINCT v FROM Video v " +
            "JOIN v.categories c " +
            "LEFT JOIN FETCH v.hashtags " +
            "WHERE c.categoryName = :category OR c.slugName = :category")
    Page<Video> findVideosByCategory(@Param("category") String category, Pageable pageable);

    @Query("SELECT v FROM Video v " +
            "LEFT JOIN FETCH v.categories " +
            "LEFT JOIN FETCH v.hashtags " +
            "WHERE v.id = :id")
    Optional<Video> findByIdWithDetails(@Param("id") Long id);
}