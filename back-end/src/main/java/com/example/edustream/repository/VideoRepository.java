package com.example.edustream.repository;

import com.example.edustream.entity.User;
import com.example.edustream.entity.Video;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {

    long count();
    List<Video> findAllByCreatedAtAfter(Instant after);
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

    @Query("SELECT v FROM Video v " +
            "WHERE v.id <> :currentVideoId " +
            "AND v.videoStatus = com.example.edustream.entity.enums.VideoStatus.ACCEPTED " +
            "AND (" +
            "   v.user.id = :authorId " + // Điều kiện 1: Cùng tác giả
            "   OR EXISTS (SELECT 1 FROM v.categories c WHERE c.categoryName IN :categories) " + // Điều kiện 2: Cùng danh mục
            "   OR EXISTS (SELECT 1 FROM v.hashtags h WHERE h.hashtagName IN :hashtags)" + // Điều kiện 3: Cùng hashtag
            ")")
    List<Video> findRelatedVideosRaw(
            @Param("currentVideoId") Long currentVideoId,
            @Param("authorId") Long authorId,
            @Param("categories") List<String> categories,
            @Param("hashtags") List<String> hashtags
    );
    @Query("SELECT DISTINCT v FROM Video v " +
            "LEFT JOIN FETCH v.user " +
            "LEFT JOIN FETCH v.categories " +
            "LEFT JOIN FETCH v.hashtags " +
            "WHERE v.id IN :ids")
    List<Video> findAllWithUserAndCategoriesAndHashtagsByIds(@Param("ids") List<Long> ids);
    @Modifying
    @Query("UPDATE Video v SET v.view = v.view + :viewsToAdd WHERE v.id = :videoId")
    void batchIncrementVideoView(@Param("videoId") Long videoId, @Param("viewsToAdd") long viewsToAdd);

    Page<Video> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}