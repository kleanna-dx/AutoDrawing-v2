package com.company.module.autodrawing.controller;

import com.company.core.common.ApiResponse;
import com.company.core.common.PageResponse;
import com.company.module.autodrawing.dto.DrawingResponse;
import com.company.module.autodrawing.dto.DrawingSaveRequest;
import com.company.module.autodrawing.dto.DrawingUpdateRequest;
import com.company.module.autodrawing.entity.DrawingStatus;
import com.company.module.autodrawing.service.DrawingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 도면 관리 REST API Controller
 * - API prefix: /autodrawing-api/drawings
 */
@RestController
@RequestMapping("/autodrawing-api/drawings")
@RequiredArgsConstructor
public class DrawingController {

    private final DrawingService drawingService;

    /**
     * 도면 단건 조회
     * GET /autodrawing-api/drawings/{drawingId}
     */
    @GetMapping("/{drawingId}")
    public ResponseEntity<ApiResponse<DrawingResponse>> getDrawing(
            @PathVariable Long drawingId) {
        DrawingResponse response = drawingService.getDrawing(drawingId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * 도면 목록 조회 (페이지네이션)
     * GET /autodrawing-api/drawings
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<DrawingResponse>>> getDrawings(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        PageResponse<DrawingResponse> response = drawingService.getDrawings(pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * 도면 검색
     * GET /autodrawing-api/drawings/search?keyword=xxx
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<DrawingResponse>>> searchDrawings(
            @RequestParam String keyword,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        PageResponse<DrawingResponse> response = drawingService.searchDrawings(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * 상태별 도면 조회
     * GET /autodrawing-api/drawings/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<PageResponse<DrawingResponse>>> getDrawingsByStatus(
            @PathVariable DrawingStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        PageResponse<DrawingResponse> response = drawingService.getDrawingsByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * 도면 생성
     * POST /autodrawing-api/drawings
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DrawingResponse>> createDrawing(
            @Valid @RequestBody DrawingSaveRequest request) {
        // TODO: JWT에서 userId 추출 (현재는 하드코딩)
        String userId = "system";
        DrawingResponse response = drawingService.createDrawing(request, userId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(response));
    }

    /**
     * 도면 수정
     * PUT /autodrawing-api/drawings/{drawingId}
     */
    @PutMapping("/{drawingId}")
    public ResponseEntity<ApiResponse<DrawingResponse>> updateDrawing(
            @PathVariable Long drawingId,
            @Valid @RequestBody DrawingUpdateRequest request) {
        String userId = "system";
        DrawingResponse response = drawingService.updateDrawing(drawingId, request, userId);
        return ResponseEntity.ok(ApiResponse.ok("도면이 수정되었습니다.", response));
    }

    /**
     * 도면 삭제 (소프트 삭제)
     * DELETE /autodrawing-api/drawings/{drawingId}
     */
    @DeleteMapping("/{drawingId}")
    public ResponseEntity<ApiResponse<Void>> deleteDrawing(
            @PathVariable Long drawingId) {
        String userId = "system";
        drawingService.deleteDrawing(drawingId, userId);
        return ResponseEntity.ok(ApiResponse.ok("도면이 삭제되었습니다.", null));
    }

    /**
     * 도면 상태 변경
     * PATCH /autodrawing-api/drawings/{drawingId}/status
     */
    @PatchMapping("/{drawingId}/status")
    public ResponseEntity<ApiResponse<DrawingResponse>> changeStatus(
            @PathVariable Long drawingId,
            @RequestParam DrawingStatus status) {
        String userId = "system";
        DrawingResponse response = drawingService.changeDrawingStatus(drawingId, status, userId);
        return ResponseEntity.ok(ApiResponse.ok("상태가 변경되었습니다.", response));
    }
}
