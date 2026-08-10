package com.company.module.autodrawing.dto;

import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 도면 버전 저장 요청 DTO
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class DrawingVersionSaveRequest {

    @Size(max = 500, message = "변경 사유는 500자 이내여야 합니다.")
    private String changeDescription;

    private String svgData;

    private String parameterSnapshot;
}
