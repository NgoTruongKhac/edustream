package com.example.edustream.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Map;

@Setter
@Getter
@Builder
public class DashboardResponseDto {
    private long totalUsers;
    private long totalVideos;
    private Map<LocalDate, Long> usersGrowth;
    private Map<LocalDate, Long> videosGrowth;
}