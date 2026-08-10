package com.company.module.autodrawing.entity;

/**
 * 도면 상태 열거형
 */
public enum DrawingStatus {

    DRAFT("작성중"),
    IN_REVIEW("검토중"),
    APPROVED("승인"),
    RELEASED("배포"),
    OBSOLETE("폐기");

    private final String description;

    DrawingStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
