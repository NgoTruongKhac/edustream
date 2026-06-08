package com.example.edustream.repository;

import com.example.edustream.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByVideoIdAndParentIsNullOrderByCreatedAtDesc(Long videoId, Pageable pageable);

    Page<Comment> findByParentIdOrderByCreatedAtAsc(Long parentId, Pageable pageable);
}