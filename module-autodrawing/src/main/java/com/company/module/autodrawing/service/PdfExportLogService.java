package com.company.module.autodrawing.service;

import com.company.core.common.PageResponse;
import com.company.core.exception.EntityNotFoundException;
import com.company.module.autodrawing.dto.PdfExportLogResponse;
import com.company.module.autodrawing.dto.PdfExportRequest;
import com.company.module.autodrawing.entity.Drawing;
import com.company.module.autodrawing.entity.ExportStatus;
import com.company.module.autodrawing.entity.PdfExportLog;
import com.company.module.autodrawing.repository.DrawingRepository;
import com.company.module.autodrawing.repository.PdfExportLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * PDF 출력 이력 서비스
 * - 출력 이력 기록
 * - 출력 이력 조회
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PdfExportLogService {

    private final DrawingRepository drawingRepository;
    private final PdfExportLogRepository pdfExportLogRepository;

    /**
     * PDF 출력 이력 생성 (PENDING 상태)
     */
    @Transactional
    public PdfExportLogResponse createExportLog(PdfExportRequest request, String userId) {
        Drawing drawing = drawingRepository.findByDrawingIdAndDeletedYn(request.getDrawingId(), "N")
                .orElseThrow(() -> new EntityNotFoundException("Drawing", request.getDrawingId()));

        String fileName = drawing.getDrawingNo() + "_v" + request.getVersionNo() + ".pdf";

        PdfExportLog log = PdfExportLog.builder()
                .drawing(drawing)
                .versionNo(request.getVersionNo())
                .fileName(fileName)
                .exportedBy(userId)
                .build();

        PdfExportLog saved = pdfExportLogRepository.save(log);
        return PdfExportLogResponse.from(saved);
    }

    /**
     * PDF 출력 성공 처리
     */
    @Transactional
    public PdfExportLogResponse markExportSuccess(Long exportId, String filePath, Long fileSize) {
        PdfExportLog log = pdfExportLogRepository.findById(exportId)
                .orElseThrow(() -> new EntityNotFoundException("PdfExportLog", exportId));
        log.markSuccess(filePath, fileSize);
        return PdfExportLogResponse.from(log);
    }

    /**
     * PDF 출력 실패 처리
     */
    @Transactional
    public PdfExportLogResponse markExportFailed(Long exportId, String errorMessage) {
        PdfExportLog log = pdfExportLogRepository.findById(exportId)
                .orElseThrow(() -> new EntityNotFoundException("PdfExportLog", exportId));
        log.markFailed(errorMessage);
        return PdfExportLogResponse.from(log);
    }

    /**
     * 도면별 출력 이력 조회
     */
    public PageResponse<PdfExportLogResponse> getExportLogs(Long drawingId, Pageable pageable) {
        Page<PdfExportLog> page = pdfExportLogRepository.findByDrawing_DrawingId(drawingId, pageable);
        List<PdfExportLogResponse> content = page.getContent().stream()
                .map(PdfExportLogResponse::from)
                .toList();
        return PageResponse.from(page, content);
    }

    /**
     * 기간별 출력 이력 조회
     */
    public PageResponse<PdfExportLogResponse> getExportLogsByPeriod(
            LocalDateTime from, LocalDateTime to, Pageable pageable) {
        Page<PdfExportLog> page = pdfExportLogRepository.findByExportedAtBetween(from, to, pageable);
        List<PdfExportLogResponse> content = page.getContent().stream()
                .map(PdfExportLogResponse::from)
                .toList();
        return PageResponse.from(page, content);
    }
}
