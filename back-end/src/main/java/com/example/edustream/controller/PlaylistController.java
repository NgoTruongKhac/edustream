package com.example.edustream.controller;

import com.example.edustream.dto.request.PlaylistRequestDto;
import com.example.edustream.dto.request.PlaylistVideoRequestDto;
import com.example.edustream.dto.response.PageResponse;
import com.example.edustream.dto.response.PlayListVideoResponseDto;
import com.example.edustream.dto.response.PlaylistResponseDto;
import com.example.edustream.entity.UserPrincipal;
import com.example.edustream.service.PlayListService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/playlists")
@RequiredArgsConstructor
public class PlaylistController {

    private final PlayListService playListService;

    @PostMapping
    public ResponseEntity<PlaylistResponseDto> createPlaylist(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody PlaylistRequestDto playlistRequestDto
    ) {
        return ResponseEntity.ok(playListService.createPlaylist(userPrincipal, playlistRequestDto));
    }

    @PostMapping("/videos")
    public ResponseEntity<PlayListVideoResponseDto> createPlaylistVideo(
            @AuthenticationPrincipal UserPrincipal userPrincipal,

            @Valid @RequestBody PlaylistVideoRequestDto playlistVideoRequestDto
    ) {
        return ResponseEntity.ok(playListService.createPlaylistVideo(userPrincipal, playlistVideoRequestDto));
    }

    @GetMapping
    public ResponseEntity<PageResponse<PlaylistResponseDto>> getPlaylists(
            @AuthenticationPrincipal UserPrincipal userPrincipal, @RequestParam(required = false) Long videoId
    ) {
        return ResponseEntity.ok(playListService.getPlaylists(userPrincipal, videoId));
    }

    @GetMapping("/{playlistId}")
    public ResponseEntity<PageResponse<PlayListVideoResponseDto>> getPlaylistVideos(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long playlistId
    ) {
        return ResponseEntity.ok(playListService.getPlaylistVideos(userPrincipal, playlistId));
    }

    @PatchMapping("/{playlistId}")
    public ResponseEntity<PlaylistResponseDto> changePlaylistName(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long playlistId,
            @Valid @RequestBody PlaylistRequestDto playlistRequestDto
    ) {
        return ResponseEntity.ok(playListService.changePlaylistName(userPrincipal, playlistRequestDto, playlistId));
    }
}