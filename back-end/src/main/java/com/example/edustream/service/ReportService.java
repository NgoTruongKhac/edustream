package com.example.edustream.service;

import com.example.edustream.dto.request.ReportRequestDto;
import com.example.edustream.dto.response.PageResponse;
import com.example.edustream.dto.response.ReportResponseDto;
import com.example.edustream.entity.Report;
import com.example.edustream.entity.User;
import com.example.edustream.entity.Video;
import com.example.edustream.entity.enums.ReportStatus;
import com.example.edustream.exception.ResourceNotFoundException;
import com.example.edustream.mapper.ReportMapper;
import com.example.edustream.repository.ReportRepository;
import com.example.edustream.repository.UserRepository; // Giả định đã có
import com.example.edustream.repository.VideoRepository; // Giả định đã có
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final VideoRepository videoRepository;
    private final ReportMapper reportMapper;

    @Transactional
    public ReportResponseDto createReport(ReportRequestDto reportRequestDto) {
        // 1. Map các trường cơ bản từ DTO sang Entity
        Report report = reportMapper.toReport(reportRequestDto);

        // 2. Tìm và gắn User bị báo cáo (nếu có)
        if (reportRequestDto.getUserId() != null) {
            User user = userRepository.findById(reportRequestDto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + reportRequestDto.getUserId()));
            report.setReportedUser(user);
        }

        // 3. Tìm và gắn Video bị báo cáo (nếu có)
        if (reportRequestDto.getVideoId() != null) {
            Video video = videoRepository.findById(reportRequestDto.getVideoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Video not found with id: " + reportRequestDto.getVideoId()));
            report.setReportedVideo(video);
        }

        // 4. Lưu vào Database và trả về Response DTO
        Report savedReport = reportRepository.save(report);
        return reportMapper.toReportResponseDto(savedReport);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReportResponseDto> getReports(int page) {
        // Cấu hình lấy 10 bản ghi trên 1 trang, sắp xếp theo thứ tự mới nhất (giảm dần)
        // Thay "createdAt" bằng tên trường thời gian tạo trong AbstractEntity của bạn (hoặc dùng "id")
        Pageable pageable = PageRequest.of(page, 10, Sort.by(Sort.Direction.DESC, "createdAt"));

        // Lấy dữ liệu phân trang từ Repo
        Page<Report> reportPage = reportRepository.findAll(pageable);

        // Map danh sách Entity sang Response DTO
        Page<ReportResponseDto> dtoPage = reportPage.map(reportMapper::toReportResponseDto);

        // Trả về theo định dạng PageResponse tùy chỉnh của bạn
        return new PageResponse<>(dtoPage);
    }
// ... Các hàm cũ giữ nguyên ...

    @Transactional
    public ReportResponseDto acceptReport(Long reportId) {
        // 1. Tìm Report theo ID
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));

        // 2. Kiểm tra điều kiện: Chỉ xử lý nếu report đang ở trạng thái PENDING
        if (report.getReportStatus() != ReportStatus.PENDING) {
            throw new IllegalStateException("Report has already been processed. Current status: " + report.getReportStatus());
        }

        // 3. Cập nhật trạng thái sang RESOLVED
        report.setReportStatus(ReportStatus.RESOLVED);

        // 4. Lưu và trả về DTO
        Report updatedReport = reportRepository.save(report);
        return reportMapper.toReportResponseDto(updatedReport);
    }

    @Transactional
    public ReportResponseDto rejectReport(Long reportId) {
        // 1. Tìm Report theo ID
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));

        // 2. Kiểm tra điều kiện: Chỉ xử lý nếu report đang ở trạng thái PENDING
        if (report.getReportStatus() != ReportStatus.PENDING) {
            throw new IllegalStateException("Report has already been processed. Current status: " + report.getReportStatus());
        }

        // 3. Cập nhật trạng thái sang REJECTED
        report.setReportStatus(ReportStatus.REJECTED);

        // 4. Lưu và trả về DTO
        Report updatedReport = reportRepository.save(report);
        return reportMapper.toReportResponseDto(updatedReport);
    }
}