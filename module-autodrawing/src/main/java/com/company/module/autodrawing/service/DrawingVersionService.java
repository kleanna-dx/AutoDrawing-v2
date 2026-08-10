package com.company.module.autodrawing.service;

import com.company.core.common.PageResponse;
import com.company.core.exception.EntityNotFoundException;
import com.company.module.autodrawing.dto.DrawingVersionResponse;
import com.company.module.autodrawing.dto.DrawingVersionSaveRequest;
import com.company.module.autodrawing.entity.Drawing;
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
 * 도면 버전 서비스
 * - 버전 이력 조회
 * - 수동 버전 생성
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DrawingVersionService {

    private final DrawingRepository drawingRepository;
    private final DrawingVersionRepository drawingVersionRepository;

    /**
     * 도면의 버전 목록 조회
     */
    public List<DrawingVersionResponse> getVersions(Long drawingId) {
        return drawingVersionRepository.findByDrawing_DrawingIdOrderByVersionNoDesc(drawingId)
                .stream()
                .map(DrawingVersionResponse::from)
                .toList();
    }

    /**
     * 도면의 버전 목록 조회 (페이지네이션)
     */
    public PageResponse<DrawingVersionResponse> getVersionsPaged(Long drawingId, Pageable pageable) {
        Page<DrawingVersion> page = drawingVersionRepository.findByDrawing_DrawingId(drawingId, pageable);
        List<DrawingVersionResponse> content = page.getContent().stream()
                .map(DrawingVersionResponse::from)
                .toList();
        return PageResponse.from(page, content);
    }

    /**
     * 특정 버전 상세 조회
     */
    public DrawingVersionResponse getVersion(Long drawingId, Integer versionNo) {
        DrawingVersion version = drawingVersionRepository
                .findByDrawing_DrawingIdAndVersionNo(drawingId, versionNo)
                .orElseThrow(() -> new EntityNotFoundException("DrawingVersion",
                        "drawingId=" + drawingId + ", versionNo=" + versionNo));
        return DrawingVersionResponse.from(version);
    }

    /**
     * 수동 버전 생성 (SVG 데이터 포함)
     */
    @Transactional
    public DrawingVersionResponse createVersion(Long drawingId,
                                                 DrawingVersionSaveRequest request,
                                                 String userId) {
        Drawing drawing = drawingRepository.findByDrawingIdAndDeletedYn(drawingId, "N")
                .orElseThrow(() -> new EntityNotFoundException("Drawing", drawingId));

        drawing.incrementVersion(userId);

        DrawingVersion newVersion = DrawingVersion.builder()
                .drawing(drawing)
                .versionNo(drawing.getCurrentVersion())
                .changeDescription(request.getChangeDescription())
                .svgData(request.getSvgData())
                .parameterSnapshot(request.getParameterSnapshot())
                .createdBy(userId)
                .build();

        DrawingVersion saved = drawingVersionRepository.save(newVersion);
        return DrawingVersionResponse.from(saved);
    }
}
