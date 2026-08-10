package com.company.module.autodrawing.entity;

/**
 * PDF 출력 상태 열거형
 */
public enum ExportStatus {

    PENDING("대기"),
    SUCCESS("성공"),
    FAILED("실패");

    private final String description;

    ExportStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
