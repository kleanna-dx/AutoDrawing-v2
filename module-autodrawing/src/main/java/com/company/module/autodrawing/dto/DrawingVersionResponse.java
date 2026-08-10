package com.company.module.autodrawing.dto;

import com.company.module.autodrawing.entity.DrawingVersion;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 도면 버전 응답 DTO
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class DrawingVersionResponse {

    private Long versionId;
    private Long drawingId;
    private Integer versionNo;
    private String changeDescription;
    private String svgData;
    private String parameterSnapshot;
    private String createdBy;
    private LocalDateTime createdAt;

    /**
     * Entity → Response 변환 팩토리 메서드
     */
    public static DrawingVersionResponse from(DrawingVersion entity) {
        return new DrawingVersionResponse(
                entity.getVersionId(),
                entity.getDrawing().getDrawingId(),
                entity.getVersionNo(),
                entity.getChangeDescription(),
                entity.getSvgData(),
                entity.getParameterSnapshot(),
                entity.getCreatedBy(),
                entity.getCreatedAt()
        );
    }
}
