package com.company.module.autodrawing.dto;

import com.company.module.autodrawing.entity.Drawing;
import com.company.module.autodrawing.entity.DrawingStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 도면 응답 DTO
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class DrawingResponse {

    private Long drawingId;
    private String drawingName;
    private String drawingNo;
    private String description;
    private Double shaftDiameter;
    private Double shaftLength;
    private Integer sectionCount;
    private String parameterJson;
    private DrawingStatus status;
    private String statusDescription;
    private Integer currentVersion;
    private String createdBy;
    private LocalDateTime createdAt;
    private String updatedBy;
    private LocalDateTime updatedAt;

    /**
     * Entity → Response 변환 팩토리 메서드
     */
    public static DrawingResponse from(Drawing entity) {
        return new DrawingResponse(
                entity.getDrawingId(),
                entity.getDrawingName(),
                entity.getDrawingNo(),
                entity.getDescription(),
                entity.getShaftDiameter(),
                entity.getShaftLength(),
                entity.getSectionCount(),
                entity.getParameterJson(),
                entity.getStatus(),
                entity.getStatus().getDescription(),
                entity.getCurrentVersion(),
                entity.getCreatedBy(),
                entity.getCreatedAt(),
                entity.getUpdatedBy(),
                entity.getUpdatedAt()
        );
    }
}
