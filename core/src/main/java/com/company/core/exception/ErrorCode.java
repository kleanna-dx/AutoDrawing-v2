package com.company.core.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 공통 에러 코드 열거형
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Common
    INVALID_INPUT("C001", "잘못된 입력값입니다."),
    RESOURCE_NOT_FOUND("C002", "리소스를 찾을 수 없습니다."),
    INTERNAL_SERVER_ERROR("C003", "서버 내부 오류가 발생했습니다."),
    UNAUTHORIZED("C004", "인증이 필요합니다."),
    FORBIDDEN("C005", "권한이 없습니다."),

    // Drawing
    DRAWING_NOT_FOUND("D001", "도면을 찾을 수 없습니다."),
    DRAWING_VERSION_NOT_FOUND("D002", "도면 버전을 찾을 수 없습니다."),
    DRAWING_DUPLICATE_NAME("D003", "중복된 도면명이 존재합니다."),

    // PDF Export
    PDF_EXPORT_FAILED("P001", "PDF 출력에 실패했습니다."),
    PDF_EXPORT_LOG_NOT_FOUND("P002", "PDF 출력 이력을 찾을 수 없습니다.");

    private final String code;
    private final String message;
}
