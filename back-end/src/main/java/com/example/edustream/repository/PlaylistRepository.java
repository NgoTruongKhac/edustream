package com.example.edustream.repository;

import com.example.edustream.entity.Playlist;
import com.example.edustream.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    Page<Playlist> findByUser(User user, Pageable pageable);

    Optional<Playlist> findByIdAndUser(Long id, User user);

    boolean existsByUserAndPlaylistName(User user, String playlistName);

}