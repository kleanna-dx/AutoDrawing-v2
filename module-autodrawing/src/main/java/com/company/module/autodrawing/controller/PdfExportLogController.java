package com.company.module.autodrawing.controller;

import com.company.core.common.ApiResponse;
import com.company.core.common.PageResponse;
import com.company.module.autodrawing.dto.PdfExportLogResponse;
import com.company.module.autodrawing.dto.PdfExportRequest;
import com.company.module.autodrawing.service.PdfExportLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * PDF 출력 이력 REST API Controller
 * - API prefix: /autodrawing-api/pdf-exports
 */
@RestController
@RequestMapping("/autodrawing-api/pdf-exports")
@RequiredArgsConstructor
public class PdfExportLogController {

    private final PdfExportLogService pdfExportLogService;

    /**
     * PDF 출력 이력 생성 (출력 시작)
     * POST /autodrawing-api/pdf-exports
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PdfExportLogResponse>> createExportLog(
            @Valid @RequestBody PdfExportRequest request) {
        String userId = "system";
        PdfExportLogResponse response = pdfExportLogService.createExportLog(request, userId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(response));
    }

    /**
     * PDF 출력 성공 처리
     * PATCH /autodrawing-api/pdf-exports/{exportId}/success
     */
    @PatchMapping("/{exportId}/success")
    public ResponseEntity<ApiResponse<PdfExportLogResponse>> markSuccess(
            @PathVariable Long exportId,
            @RequestParam String filePath,
            @RequestParam Long fileSize) {
        PdfExportLogResponse response =
                pdfExportLogService.markExportSuccess(exportId, filePath, fileSize);
        return ResponseEntity.ok(ApiResponse.ok("출력 성공 처리 완료", response));
    }

    /**
     * PDF 출력 실패 처리
     * PATCH /autodrawing-api/pdf-exports/{exportId}/failed
     */
    @PatchMapping("/{exportId}/failed")
    public ResponseEntity<ApiResponse<PdfExportLogResponse>> markFailed(
            @PathVariable Long exportId,
            @RequestParam String errorMessage) {
        PdfExportLogResponse response =
                pdfExportLogService.markExportFailed(exportId, errorMessage);
        return ResponseEntity.ok(ApiResponse.ok("출력 실패 처리 완료", response));
    }

    /**
     * 도면별 PDF 출력 이력 조회
     * GET /autodrawing-api/pdf-exports/drawing/{drawingId}
     */
    @GetMapping("/drawing/{drawingId}")
    public ResponseEntity<ApiResponse<PageResponse<PdfExportLogResponse>>> getExportLogs(
            @PathVariable Long drawingId,
            @PageableDefault(size = 20, sort = "exportedAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        PageResponse<PdfExportLogResponse> response =
                pdfExportLogService.getExportLogs(drawingId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * 기간별 PDF 출력 이력 조회
     * GET /autodrawing-api/pdf-exports/period?from=...&to=...
     */
    @GetMapping("/period")
    public ResponseEntity<ApiResponse<PageResponse<PdfExportLogResponse>>> getExportLogsByPeriod(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @PageableDefault(size = 20, sort = "exportedAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        PageResponse<PdfExportLogResponse> response =
                pdfExportLogService.getExportLogsByPeriod(from, to, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
