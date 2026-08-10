package com.company.module.autodrawing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 도면 저장 요청 DTO
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class DrawingSaveRequest {

    @NotBlank(message = "도면명은 필수 입력입니다.")
    @Size(max = 200, message = "도면명은 200자 이내여야 합니다.")
    private String drawingName;

    @NotBlank(message = "도면번호는 필수 입력입니다.")
    @Size(max = 50, message = "도면번호는 50자 이내여야 합니다.")
    private String drawingNo;

    @Size(max = 1000, message = "설명은 1000자 이내여야 합니다.")
    private String description;

    @Positive(message = "축 직경은 양수여야 합니다.")
    private Double shaftDiameter;

    @Positive(message = "축 길이는 양수여야 합니다.")
    private Double shaftLength;

    private Integer sectionCount;

    private String parameterJson;
}
