package com.company.core.common;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 페이지네이션 응답 래퍼
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PageResponse<T> {

    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;

    public static <T> PageResponse<T> of(
            List<T> content, int page, int size,
            long totalElements, int totalPages,
            boolean first, boolean last) {
        return new PageResponse<>(content, page, size, totalElements, totalPages, first, last);
    }

    /**
     * Spring Data Page 객체에서 변환
     */
    public static <T> PageResponse<T> from(
            org.springframework.data.domain.Page<?> pageResult,
            List<T> convertedContent) {
        return new PageResponse<>(
                convertedContent,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isFirst(),
                pageResult.isLast()
        );
    }
}
