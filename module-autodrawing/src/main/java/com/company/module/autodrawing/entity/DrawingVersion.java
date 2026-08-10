package com.company.module.autodrawing.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 도면 버전 엔티티
 * - 도면의 버전별 이력 관리
 * - SVG/JSON 데이터 저장
 */
@Entity
@Table(name = "drawing_version")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DrawingVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "VERSION_ID")
    private Long versionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DRAWING_ID", nullable = false)
    private Drawing drawing;

    @Column(name = "VERSION_NO", nullable = false)
    private Integer versionNo;

    @Column(name = "CHANGE_DESCRIPTION", length = 500)
    private String changeDescription;

    @Column(name = "SVG_DATA", columnDefinition = "LONGTEXT")
    private String svgData;

    @Column(name = "PARAMETER_SNAPSHOT", columnDefinition = "LONGTEXT")
    private String parameterSnapshot;

    @Column(name = "CREATED_BY", length = 50)
    private String createdBy;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    private DrawingVersion(Drawing drawing, Integer versionNo,
                           String changeDescription, String svgData,
                           String parameterSnapshot, String createdBy) {
        this.drawing = drawing;
        this.versionNo = versionNo;
        this.changeDescription = changeDescription;
        this.svgData = svgData;
        this.parameterSnapshot = parameterSnapshot;
        this.createdBy = createdBy;
    }
}
