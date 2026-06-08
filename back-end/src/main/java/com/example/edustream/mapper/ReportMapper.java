package com.example.edustream.mapper;

import com.example.edustream.dto.request.ReportRequestDto;
import com.example.edustream.dto.response.ReportResponseDto;
import com.example.edustream.entity.Report;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ReportMapper {

    @Mapping(source = "reportedUser.id", target = "userId")
    @Mapping(source = "reportedUser.avatar", target = "avatar")
    @Mapping(source = "reportedUser.fullName", target = "fullName")
    @Mapping(source = "reportedUser.username", target = "username")
    @Mapping(source = "reportedVideo.id", target = "videoId")
    @Mapping(source = "reportedVideo.title", target = "title")
    @Mapping(source = "reportedVideo.thumbnail", target = "thumbnail")
    ReportResponseDto toReportResponseDto(Report report);

    @Mapping(target = "reportedUser", ignore = true)
    @Mapping(target = "reportedVideo", ignore = true)
    @Mapping(target = "reportStatus", constant = "PENDING")
    Report toReport(ReportRequestDto reportRequestDto);
}