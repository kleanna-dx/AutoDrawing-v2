package com.company.module.autodrawing.repository;

import com.company.module.autodrawing.entity.DrawingVersion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 도면 버전 Repository
 */
public interface DrawingVersionRepository extends JpaRepository<DrawingVersion, Long> {

    /**
     * 도면 ID별 버전 목록 조회 (최신순)
     */
    List<DrawingVersion> findByDrawing_DrawingIdOrderByVersionNoDesc(Long drawingId);

    /**
     * 도면 ID별 버전 페이지 조회
     */
    Page<DrawingVersion> findByDrawing_DrawingId(Long drawingId, Pageable pageable);

    /**
     * 도면 ID + 버전번호로 단건 조회
     */
    Optional<DrawingVersion> findByDrawing_DrawingIdAndVersionNo(Long drawingId, Integer versionNo);

    /**
     * 도면의 최신 버전번호 조회
     */
    Optional<DrawingVersion> findTopByDrawing_DrawingIdOrderByVersionNoDesc(Long drawingId);
}
