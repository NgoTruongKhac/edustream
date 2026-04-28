package com.example.edustream.service;

import com.example.edustream.dto.request.PlaylistRequestDto;
import com.example.edustream.dto.request.PlaylistVideoRequestDto;
import com.example.edustream.dto.response.PageResponse;
import com.example.edustream.dto.response.PlayListVideoResponseDto;
import com.example.edustream.dto.response.PlaylistResponseDto;
import com.example.edustream.entity.*;
import com.example.edustream.exception.PlaylistNameAlreadyExistsException;
import com.example.edustream.exception.ResourceNotFoundException;
import com.example.edustream.exception.VideoAlreadyExistInPlaylistException;
import com.example.edustream.mapper.PlaylistMapper;
import com.example.edustream.mapper.PlaylistVideoMapper;
import com.example.edustream.repository.PlaylistRepository;
import com.example.edustream.repository.PlaylistVideoRepository;
import com.example.edustream.repository.UserRepository;
import com.example.edustream.repository.VideoRepository;
import com.example.edustream.repository.projection.PlaylistVideoCountProjection;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlayListService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistVideoRepository playlistVideoRepository;
    private final UserRepository userRepository;
    private final VideoRepository videoRepository;
    private final PlaylistMapper playlistMapper;
    private final PlaylistVideoMapper playlistVideoMapper;

    public PlaylistResponseDto createPlaylist(UserPrincipal userPrincipal, PlaylistRequestDto playlistRequestDto) {
        User user = userPrincipal.getUser();

        String playlistName = playlistRequestDto.getPlaylistName().trim();
        if (playlistRepository.existsByUserAndPlaylistName(user, playlistName)) {
            throw new PlaylistNameAlreadyExistsException("Playlist name already exists");
        }

        Playlist playlist = playlistMapper.toPlaylist(playlistRequestDto);
        playlist.setPlaylistName(playlistName);
        playlist.setUser(user);

        Playlist saved = playlistRepository.save(playlist);

        PlaylistResponseDto response = playlistMapper.toPlaylistResponseDto(saved);
        response.setThumbnail(null);
        response.setVideoCount(0L);
        return response;
    }

    public PlayListVideoResponseDto createPlaylistVideo(UserPrincipal userPrincipal, PlaylistVideoRequestDto playlistVideoRequestDto) {
        User user = userPrincipal.getUser();

        Playlist playlist = playlistRepository.findByIdAndUser(playlistVideoRequestDto.getPlaylistId(), user)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found"));

        Video video = videoRepository.findById(playlistVideoRequestDto.getVideoId())
                .orElseThrow(() -> new ResourceNotFoundException("Video not found"));

        if (playlistVideoRepository.existsByPlaylist_IdAndVideo_Id(playlist.getId(), video.getId())) {
            throw new VideoAlreadyExistInPlaylistException("Video already exists in playlist");
        }

        PlaylistVideo playlistVideo = new PlaylistVideo();
        playlistVideo.setPlaylist(playlist);
        playlistVideo.setVideo(video);

        PlaylistVideo saved = playlistVideoRepository.save(playlistVideo);
        return playlistVideoMapper.toPlaylistVideoResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<PlaylistResponseDto> getPlaylists(UserPrincipal userPrincipal, Long videoId) {
        User user = userPrincipal.getUser();

        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Playlist> page = playlistRepository.findByUser(user, pageable);

        if (page.isEmpty()) {
            return new PageResponse<>(new PageImpl<>(List.of(), pageable, 0));
        }

        List<Long> playlistIds = page.getContent().stream()
                .map(Playlist::getId)
                .toList();
        List<Long> containedPlaylistIds = List.of();
        if (videoId != null) {
            containedPlaylistIds = playlistVideoRepository.findPlaylistIdsContainingVideo(videoId, playlistIds);
        }

        Map<Long, Long> countMap = playlistVideoRepository.countVideosByPlaylistIds(playlistIds)
                .stream()
                .collect(Collectors.toMap(
                        PlaylistVideoCountProjection::getPlaylistId,
                        PlaylistVideoCountProjection::getTotal
                ));

        Map<Long, String> thumbnailMap = new HashMap<>();
        List<PlaylistVideo> playlistVideos = playlistVideoRepository.findAllByPlaylistIdsOrderByPlaylistIdAscCreatedAtDesc(playlistIds);

        for (PlaylistVideo pv : playlistVideos) {
            Long pid = pv.getPlaylist().getId();
            thumbnailMap.putIfAbsent(pid, pv.getVideo().getThumbnail());
        }

        final List<Long> finalContainedIds = containedPlaylistIds;
        List<PlaylistResponseDto> content = page.getContent().stream()
                .map(playlist -> {
                    PlaylistResponseDto dto = playlistMapper.toPlaylistResponseDto(playlist);
                    dto.setVideoCount(countMap.getOrDefault(playlist.getId(), 0L));
                    dto.setThumbnail(thumbnailMap.get(playlist.getId()));
                    dto.setInPlaylist(finalContainedIds.contains(playlist.getId()));
                    return dto;
                })
                .toList();

        return new PageResponse<>(new PageImpl<>(content, pageable, page.getTotalElements()));
    }

    @Transactional(readOnly = true)
    public PageResponse<PlayListVideoResponseDto> getPlaylistVideos(UserPrincipal userPrincipal, Long playlistId) {
        User user = userPrincipal.getUser();

        Playlist playlist = playlistRepository.findByIdAndUser(playlistId, user)
                .orElseThrow(() -> new NoSuchElementException("Playlist not found"));

        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<PlaylistVideo> page = playlistVideoRepository.findByPlaylist_Id(playlist.getId(), pageable);

        Page<PlayListVideoResponseDto> dtoPage = page.map(playlistVideoMapper::toPlaylistVideoResponseDto);
        return new PageResponse<>(dtoPage);
    }

    public PlaylistResponseDto changePlaylistName(UserPrincipal userPrincipal, PlaylistRequestDto playlistRequestDto, Long playlistId) {
        User user = userPrincipal.getUser();

        Playlist playlist = playlistRepository.findByIdAndUser(playlistId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found"));

        String newPlaylistName = playlistRequestDto.getPlaylistName().trim();

        boolean duplicated = playlistRepository.existsByUserAndPlaylistName(user, newPlaylistName)
                && !playlist.getPlaylistName().equalsIgnoreCase(newPlaylistName);

        if (duplicated) {
            throw new PlaylistNameAlreadyExistsException("Playlist name already exists");
        }

        playlist.setPlaylistName(newPlaylistName);

        Playlist saved = playlistRepository.save(playlist);
        PlaylistResponseDto response = playlistMapper.toPlaylistResponseDto(saved);

        Long videoCount = playlistVideoRepository.countByPlaylist_Id(saved.getId());
        response.setVideoCount(videoCount);

        PlaylistVideo latest = playlistVideoRepository.findTopByPlaylist_IdOrderByCreatedAtDesc(saved.getId()).orElse(null);
        response.setThumbnail(latest != null ? latest.getVideo().getThumbnail() : null);

        return response;
    }
}