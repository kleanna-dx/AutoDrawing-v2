package com.company.module.autodrawing.controller;

import com.company.core.common.ApiResponse;
import com.company.core.common.PageResponse;
import com.company.module.autodrawing.dto.DrawingVersionResponse;
import com.company.module.autodrawing.dto.DrawingVersionSaveRequest;
import com.company.module.autodrawing.service.DrawingVersionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 도면 버전 관리 REST API Controller
 * - API prefix: /autodrawing-api/drawings/{drawingId}/versions
 */
@RestController
@RequestMapping("/autodrawing-api/drawings/{drawingId}/versions")
@RequiredArgsConstructor
public class DrawingVersionController {

    private final DrawingVersionService drawingVersionService;

    /**
     * 도면 버전 목록 조회
     * GET /autodrawing-api/drawings/{drawingId}/versions
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DrawingVersionResponse>>> getVersions(
            @PathVariable Long drawingId) {
        List<DrawingVersionResponse> response = drawingVersionService.getVersions(drawingId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * 도면 버전 목록 조회 (페이지네이션)
     * GET /autodrawing-api/drawings/{drawingId}/versions/page
     */
    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<DrawingVersionResponse>>> getVersionsPaged(
            @PathVariable Long drawingId,
            @PageableDefault(size = 10, sort = "versionNo", direction = Sort.Direction.DESC)
            Pageable pageable) {
        PageResponse<DrawingVersionResponse> response =
                drawingVersionService.getVersionsPaged(drawingId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * 특정 버전 상세 조회
     * GET /autodrawing-api/drawings/{drawingId}/versions/{versionNo}
     */
    @GetMapping("/{versionNo}")
    public ResponseEntity<ApiResponse<DrawingVersionResponse>> getVersion(
            @PathVariable Long drawingId,
            @PathVariable Integer versionNo) {
        DrawingVersionResponse response = drawingVersionService.getVersion(drawingId, versionNo);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * 수동 버전 생성
     * POST /autodrawing-api/drawings/{drawingId}/versions
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DrawingVersionResponse>> createVersion(
            @PathVariable Long drawingId,
            @Valid @RequestBody DrawingVersionSaveRequest request) {
        String userId = "system";
        DrawingVersionResponse response =
                drawingVersionService.createVersion(drawingId, request, userId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(response));
    }
}
