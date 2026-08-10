package com.company.module.autodrawing.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 도면 엔티티
 * - 도면 기본 정보 관리
 * - 버전 관리 연관관계 포함
 */
@Entity
@Table(name = "drawing")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Drawing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DRAWING_ID")
    private Long drawingId;

    @Column(name = "DRAWING_NAME", nullable = false, length = 200)
    private String drawingName;

    @Column(name = "DRAWING_NO", nullable = false, unique = true, length = 50)
    private String drawingNo;

    @Column(name = "DESCRIPTION", length = 1000)
    private String description;

    @Column(name = "SHAFT_DIAMETER")
    private Double shaftDiameter;

    @Column(name = "SHAFT_LENGTH")
    private Double shaftLength;

    @Column(name = "SECTION_COUNT")
    private Integer sectionCount;

    @Column(name = "PARAMETER_JSON", columnDefinition = "TEXT")
    private String parameterJson;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 20)
    private DrawingStatus status;

    @Column(name = "CURRENT_VERSION")
    private Integer currentVersion;

    @Column(name = "CREATED_BY", length = 50)
    private String createdBy;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @Column(name = "DELETED_YN", nullable = false, length = 1)
    private String deletedYn;

    @OneToMany(mappedBy = "drawing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DrawingVersion> versions = new ArrayList<>();

    @OneToMany(mappedBy = "drawing", cascade = CascadeType.ALL)
    private List<PdfExportLog> pdfExportLogs = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.deletedYn == null) {
            this.deletedYn = "N";
        }
        if (this.status == null) {
            this.status = DrawingStatus.DRAFT;
        }
        if (this.currentVersion == null) {
            this.currentVersion = 1;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    private Drawing(String drawingName, String drawingNo, String description,
                    Double shaftDiameter, Double shaftLength, Integer sectionCount,
                    String parameterJson, DrawingStatus status, String createdBy) {
        this.drawingName = drawingName;
        this.drawingNo = drawingNo;
        this.description = description;
        this.shaftDiameter = shaftDiameter;
        this.shaftLength = shaftLength;
        this.sectionCount = sectionCount;
        this.parameterJson = parameterJson;
        this.status = status != null ? status : DrawingStatus.DRAFT;
        this.currentVersion = 1;
        this.createdBy = createdBy;
        this.deletedYn = "N";
    }

    // ===== Business Methods (도메인 로직) =====

    public void updateInfo(String drawingName, String description,
                           Double shaftDiameter, Double shaftLength,
                           Integer sectionCount, String parameterJson,
                           String updatedBy) {
        this.drawingName = drawingName;
        this.description = description;
        this.shaftDiameter = shaftDiameter;
        this.shaftLength = shaftLength;
        this.sectionCount = sectionCount;
        this.parameterJson = parameterJson;
        this.updatedBy = updatedBy;
    }

    public void incrementVersion(String updatedBy) {
        this.currentVersion++;
        this.updatedBy = updatedBy;
    }

    public void changeStatus(DrawingStatus newStatus, String updatedBy) {
        this.status = newStatus;
        this.updatedBy = updatedBy;
    }

    public void softDelete(String deletedBy) {
        this.deletedYn = "Y";
        this.updatedBy = deletedBy;
    }

    public boolean isDeleted() {
        return "Y".equals(this.deletedYn);
    }
}
