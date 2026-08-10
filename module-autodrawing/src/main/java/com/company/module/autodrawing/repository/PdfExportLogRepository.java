package com.company.module.autodrawing.repository;

import com.company.module.autodrawing.entity.ExportStatus;
import com.company.module.autodrawing.entity.PdfExportLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * PDF 출력 이력 Repository
 */
public interface PdfExportLogRepository extends JpaRepository<PdfExportLog, Long> {

    /**
     * 도면 ID별 출력 이력 조회
     */
    Page<PdfExportLog> findByDrawing_DrawingId(Long drawingId, Pageable pageable);

    /**
     * 도면 ID + 상태별 출력 이력 조회
     */
    List<PdfExportLog> findByDrawing_DrawingIdAndExportStatus(Long drawingId, ExportStatus exportStatus);

    /**
     * 기간별 출력 이력 조회
     */
    Page<PdfExportLog> findByExportedAtBetween(LocalDateTime from, LocalDateTime to, Pageable pageable);

    /**
     * 출력자별 이력 조회
     */
    Page<PdfExportLog> findByExportedBy(String exportedBy, Pageable pageable);
}
