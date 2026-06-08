package com.example.edustream.service;

import com.example.edustream.controller.DashboardController;
import com.example.edustream.dto.response.DashboardResponseDto;
import com.example.edustream.entity.User;
import com.example.edustream.entity.Video;
import com.example.edustream.repository.UserRepository;
import com.example.edustream.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final UserRepository userRepository;
    private final VideoRepository videoRepository;

    public DashboardResponseDto getDashboard() {
        Instant oneWeekAgo = LocalDate.now().minusDays(7).atStartOfDay(ZoneOffset.UTC).toInstant();

        long totalUsers = userRepository.count();
        long totalVideos = videoRepository.count();

        List<User> recentUsers = userRepository.findAllByCreatedAtAfter(oneWeekAgo);
        List<Video> recentVideos = videoRepository.findAllByCreatedAtAfter(oneWeekAgo);

        Map<LocalDate, Long> usersGrowth = recentUsers.stream()
                .collect(Collectors.groupingBy(
                        u -> LocalDate.ofInstant(u.getCreatedAt(), ZoneOffset.UTC),
                        Collectors.counting()
                ));

        Map<LocalDate, Long> videosGrowth = recentVideos.stream()
                .collect(Collectors.groupingBy(
                        v -> LocalDate.ofInstant(v.getCreatedAt(), ZoneOffset.UTC),
                        Collectors.counting()
                ));

        return DashboardResponseDto.builder()
                .totalUsers(totalUsers)
                .totalVideos(totalVideos)
                .usersGrowth(usersGrowth)
                .videosGrowth(videosGrowth)
                .build();
    }
}
