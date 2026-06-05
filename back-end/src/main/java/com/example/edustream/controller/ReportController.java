package com.example.edustream.controller;

import com.example.edustream.dto.request.ReportRequestDto;
import com.example.edustream.dto.response.PageResponse;
import com.example.edustream.dto.response.ReportResponseDto;
import com.example.edustream.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ReportResponseDto> createReport(@RequestBody ReportRequestDto reportRequestDto) {
        ReportResponseDto response = reportService.createReport(reportRequestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<PageResponse<ReportResponseDto>> getReports(@RequestParam(defaultValue = "0") int page) {
        PageResponse<ReportResponseDto> response = reportService.getReports(page);
        return ResponseEntity.ok(response);
    }
    // ... Các hàm cũ giữ nguyên ...

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/accept")
    public ResponseEntity<ReportResponseDto> acceptReport(@PathVariable("id") Long reportId) {
        ReportResponseDto response = reportService.acceptReport(reportId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ReportResponseDto> rejectReport(@PathVariable("id") Long reportId) {
        ReportResponseDto response = reportService.rejectReport(reportId);
        return ResponseEntity.ok(response);
    }
}