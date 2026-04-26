package com.example.edustream.repository;

import com.example.edustream.entity.User;
import com.example.edustream.entity.Video;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {

    Page<Video> findByUser(User user, Pageable pageable);
    Page<Video> findByUser_Username(String username, Pageable pageable);
}