package com.company.module.autodrawing.repository;

import com.company.module.autodrawing.entity.Drawing;
import com.company.module.autodrawing.entity.DrawingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * 도면 Repository
 */
public interface DrawingRepository extends JpaRepository<Drawing, Long> {

    /**
     * 삭제되지 않은 도면 단건 조회
     */
    Optional<Drawing> findByDrawingIdAndDeletedYn(Long drawingId, String deletedYn);

    /**
     * 도면번호 중복 확인
     */
    boolean existsByDrawingNoAndDeletedYn(String drawingNo, String deletedYn);

    /**
     * 삭제되지 않은 도면 페이지 조회
     */
    Page<Drawing> findByDeletedYn(String deletedYn, Pageable pageable);

    /**
     * 상태별 도면 조회
     */
    Page<Drawing> findByStatusAndDeletedYn(DrawingStatus status, String deletedYn, Pageable pageable);

    /**
     * 도면명 검색 (부분 일치)
     */
    @Query("SELECT d FROM Drawing d WHERE d.deletedYn = :deletedYn " +
            "AND (d.drawingName LIKE %:keyword% OR d.drawingNo LIKE %:keyword%)")
    Page<Drawing> searchByKeyword(@Param("keyword") String keyword,
                                  @Param("deletedYn") String deletedYn,
                                  Pageable pageable);

    /**
     * 도면번호로 단건 조회
     */
    Optional<Drawing> findByDrawingNoAndDeletedYn(String drawingNo, String deletedYn);
}
