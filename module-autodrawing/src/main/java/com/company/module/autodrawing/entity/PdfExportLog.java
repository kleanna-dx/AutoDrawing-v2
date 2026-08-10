package com.company.module.autodrawing.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * PDF 출력 이력 엔티티
 * - 도면별 PDF 출력 이력 추적
 */
@Entity
@Table(name = "pdf_export_log")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PdfExportLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "EXPORT_ID")
    private Long exportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DRAWING_ID", nullable = false)
    private Drawing drawing;

    @Column(name = "VERSION_NO", nullable = false)
    private Integer versionNo;

    @Column(name = "FILE_NAME", nullable = false, length = 300)
    private String fileName;

    @Column(name = "FILE_PATH", length = 500)
    private String filePath;

    @Column(name = "FILE_SIZE")
    private Long fileSize;

    @Enumerated(EnumType.STRING)
    @Column(name = "EXPORT_STATUS", nullable = false, length = 20)
    private ExportStatus exportStatus;

    @Column(name = "ERROR_MESSAGE", length = 1000)
    private String errorMessage;

    @Column(name = "EXPORTED_BY", length = 50)
    private String exportedBy;

    @Column(name = "EXPORTED_AT", nullable = false, updatable = false)
    private LocalDateTime exportedAt;

    @PrePersist
    protected void onCreate() {
        this.exportedAt = LocalDateTime.now();
        if (this.exportStatus == null) {
            this.exportStatus = ExportStatus.PENDING;
        }
    }

    @Builder
    private PdfExportLog(Drawing drawing, Integer versionNo, String fileName,
                         String filePath, Long fileSize,
                         ExportStatus exportStatus, String exportedBy) {
        this.drawing = drawing;
        this.versionNo = versionNo;
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.exportStatus = exportStatus != null ? exportStatus : ExportStatus.PENDING;
        this.exportedBy = exportedBy;
    }

    // ===== Business Methods =====

    public void markSuccess(String filePath, Long fileSize) {
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.exportStatus = ExportStatus.SUCCESS;
    }

    public void markFailed(String errorMessage) {
        this.exportStatus = ExportStatus.FAILED;
        this.errorMessage = errorMessage;
    }
}
