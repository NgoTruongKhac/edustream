package com.example.edustream.repository;

import com.example.edustream.entity.Playlist;
import com.example.edustream.entity.PlaylistVideo;
import com.example.edustream.entity.Video;
import com.example.edustream.repository.projection.PlaylistVideoCountProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistVideoRepository extends JpaRepository<PlaylistVideo, Long> {

    @EntityGraph(attributePaths = {"playlist", "video"})
    Page<PlaylistVideo> findByPlaylist_Id(Long playlistId, Pageable pageable);

    boolean existsByPlaylist_IdAndVideo_Id(Long playlistId, Long videoId);

    long countByPlaylist_Id(Long playlistId);

    Optional<PlaylistVideo> findTopByPlaylist_IdOrderByCreatedAtDesc(Long playlistId);

    @Query("""
        select pv.playlist.id as playlistId, count(pv) as total
        from PlaylistVideo pv
        where pv.playlist.id in :playlistIds
        group by pv.playlist.id
    """)
    List<PlaylistVideoCountProjection> countVideosByPlaylistIds(@Param("playlistIds") List<Long> playlistIds);

    @Query("""
        select pv
        from PlaylistVideo pv
        join fetch pv.playlist p
        join fetch pv.video v
        where p.id in :playlistIds
        order by p.id asc, pv.createdAt desc
    """)
    List<PlaylistVideo> findAllByPlaylistIdsOrderByPlaylistIdAscCreatedAtDesc(@Param("playlistIds") List<Long> playlistIds);

    @Query("""
    SELECT pv.playlist.id 
    FROM PlaylistVideo pv
    WHERE pv.video.id = :videoId 
    AND pv.playlist.id IN :playlistIds
""")
    List<Long> findPlaylistIdsContainingVideo(Long videoId, List<Long> playlistIds);
}