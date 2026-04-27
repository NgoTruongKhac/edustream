package com.example.edustream.repository;


import com.example.edustream.entity.Comment;
import com.example.edustream.entity.CommentLike;
import com.example.edustream.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    Optional<CommentLike> findByCommentAndUser(Comment comment, User user);
}
