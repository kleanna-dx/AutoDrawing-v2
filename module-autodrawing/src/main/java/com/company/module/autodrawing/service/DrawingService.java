package com.company.module.autodrawing.service;

import com.company.core.common.PageResponse;
import com.company.core.exception.EntityNotFoundException;
import com.company.core.exception.ErrorCode;
import com.company.core.exception.BusinessException;
import com.company.module.autodrawing.dto.*;
import com.company.module.autodrawing.entity.Drawing;
import com.company.module.autodrawing.entity.DrawingStatus;
import com.company.module.autodrawing.entity.DrawingVersion;
import com.company.module.autodrawing.repository.DrawingRepository;
import com.company.module.autodrawing.repository.DrawingVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 도면 서비스
 * - 도면 CRUD
 * - 도면 검색
 * - 상태 변경
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DrawingService {

    private final DrawingRepository drawingRepository;
    private final DrawingVersionRepository drawingVersionRepository;

    /**
     * 도면 단건 조회
     */
    public DrawingResponse getDrawing(Long drawingId) {
        Drawing drawing = findActiveDrawing(drawingId);
        return DrawingResponse.from(drawing);
    }

    /**
     * 도면 목록 조회 (페이지네이션)
     */
    public PageResponse<DrawingResponse> getDrawings(Pageable pageable) {
        Page<Drawing> page = drawingRepository.findByDeletedYn("N", pageable);
        List<DrawingResponse> content = page.getContent().stream()
                .map(DrawingResponse::from)
                .toList();
        return PageResponse.from(page, content);
    }

    /**
     * 도면 검색
     */
    public PageResponse<DrawingResponse> searchDrawings(String keyword, Pageable pageable) {
        Page<Drawing> page = drawingRepository.searchByKeyword(keyword, "N", pageable);
        List<DrawingResponse> content = page.getContent().stream()
                .map(DrawingResponse::from)
                .toList();
        return PageResponse.from(page, content);
    }

    /**
     * 상태별 도면 조회
     */
    public PageResponse<DrawingResponse> getDrawingsByStatus(DrawingStatus status, Pageable pageable) {
        Page<Drawing> page = drawingRepository.findByStatusAndDeletedYn(status, "N", pageable);
        List<DrawingResponse> content = page.getContent().stream()
                .map(DrawingResponse::from)
                .toList();
        return PageResponse.from(page, content);
    }

    /**
     * 도면 생성
     */
    @Transactional
    public DrawingResponse createDrawing(DrawingSaveRequest request, String userId) {
        // 도면번호 중복 체크
        if (drawingRepository.existsByDrawingNoAndDeletedYn(request.getDrawingNo(), "N")) {
            throw new BusinessException(ErrorCode.DRAWING_DUPLICATE_NAME,
                    "도면번호 '" + request.getDrawingNo() + "'이(가) 이미 존재합니다.");
        }

        Drawing drawing = Drawing.builder()
                .drawingName(request.getDrawingName())
                .drawingNo(request.getDrawingNo())
                .description(request.getDescription())
                .shaftDiameter(request.getShaftDiameter())
                .shaftLength(request.getShaftLength())
                .sectionCount(request.getSectionCount())
                .parameterJson(request.getParameterJson())
                .createdBy(userId)
                .build();

        Drawing saved = drawingRepository.save(drawing);

        // 초기 버전 자동 생성
        DrawingVersion initialVersion = DrawingVersion.builder()
                .drawing(saved)
                .versionNo(1)
                .changeDescription("초기 버전 생성")
                .parameterSnapshot(request.getParameterJson())
                .createdBy(userId)
                .build();
        drawingVersionRepository.save(initialVersion);

        return DrawingResponse.from(saved);
    }

    /**
     * 도면 수정 (새 버전 자동 생성)
     */
    @Transactional
    public DrawingResponse updateDrawing(Long drawingId, DrawingUpdateRequest request, String userId) {
        Drawing drawing = findActiveDrawing(drawingId);

        drawing.updateInfo(
                request.getDrawingName(),
                request.getDescription(),
                request.getShaftDiameter(),
                request.getShaftLength(),
                request.getSectionCount(),
                request.getParameterJson(),
                userId
        );

        // 새 버전 생성
        drawing.incrementVersion(userId);
        DrawingVersion newVersion = DrawingVersion.builder()
                .drawing(drawing)
                .versionNo(drawing.getCurrentVersion())
                .changeDescription(request.getChangeDescription())
                .parameterSnapshot(request.getParameterJson())
                .createdBy(userId)
                .build();
        drawingVersionRepository.save(newVersion);

        return DrawingResponse.from(drawing);
    }

    /**
     * 도면 삭제 (소프트 삭제)
     */
    @Transactional
    public void deleteDrawing(Long drawingId, String userId) {
        Drawing drawing = findActiveDrawing(drawingId);
        drawing.softDelete(userId);
    }

    /**
     * 도면 상태 변경
     */
    @Transactional
    public DrawingResponse changeDrawingStatus(Long drawingId, DrawingStatus newStatus, String userId) {
        Drawing drawing = findActiveDrawing(drawingId);
        drawing.changeStatus(newStatus, userId);
        return DrawingResponse.from(drawing);
    }

    // ===== Private Helper Methods =====

    private Drawing findActiveDrawing(Long drawingId) {
        return drawingRepository.findByDrawingIdAndDeletedYn(drawingId, "N")
                .orElseThrow(() -> new EntityNotFoundException("Drawing", drawingId));
    }
}
