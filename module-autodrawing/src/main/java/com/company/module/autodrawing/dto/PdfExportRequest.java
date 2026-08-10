package com.company.module.autodrawing.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * PDF 출력 요청 DTO
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class PdfExportRequest {

    @NotNull(message = "도면 ID는 필수 입력입니다.")
    @Positive(message = "도면 ID는 양수여야 합니다.")
    private Long drawingId;

    @NotNull(message = "버전 번호는 필수 입력입니다.")
    @Positive(message = "버전 번호는 양수여야 합니다.")
    private Integer versionNo;
}
