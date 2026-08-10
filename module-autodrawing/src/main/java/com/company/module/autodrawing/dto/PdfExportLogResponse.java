package com.company.module.autodrawing.dto;

import com.company.module.autodrawing.entity.ExportStatus;
import com.company.module.autodrawing.entity.PdfExportLog;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * PDF 출력 이력 응답 DTO
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PdfExportLogResponse {

    private Long exportId;
    private Long drawingId;
    private String drawingName;
    private Integer versionNo;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private ExportStatus exportStatus;
    private String exportStatusDescription;
    private String errorMessage;
    private String exportedBy;
    private LocalDateTime exportedAt;

    /**
     * Entity → Response 변환 팩토리 메서드
     */
    public static PdfExportLogResponse from(PdfExportLog entity) {
        return new PdfExportLogResponse(
                entity.getExportId(),
                entity.getDrawing().getDrawingId(),
                entity.getDrawing().getDrawingName(),
                entity.getVersionNo(),
                entity.getFileName(),
                entity.getFilePath(),
                entity.getFileSize(),
                entity.getExportStatus(),
                entity.getExportStatus().getDescription(),
                entity.getErrorMessage(),
                entity.getExportedBy(),
                entity.getExportedAt()
        );
    }
}
