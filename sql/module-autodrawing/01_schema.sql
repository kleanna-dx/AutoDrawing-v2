-- ============================================================
-- AutoDrawing Module - DDL Schema
-- Database: MariaDB 10.11+
-- Charset: utf8mb4
-- ============================================================

-- 도면 테이블
CREATE TABLE IF NOT EXISTS drawing (
    DRAWING_ID      BIGINT          NOT NULL AUTO_INCREMENT  COMMENT '도면 ID (PK)',
    DRAWING_NAME    VARCHAR(200)    NOT NULL                 COMMENT '도면명',
    DRAWING_NO      VARCHAR(50)     NOT NULL                 COMMENT '도면번호 (Unique)',
    DESCRIPTION     VARCHAR(1000)   NULL                     COMMENT '도면 설명',
    SHAFT_DIAMETER  DOUBLE          NULL                     COMMENT '축 직경 (mm)',
    SHAFT_LENGTH    DOUBLE          NULL                     COMMENT '축 길이 (mm)',
    SECTION_COUNT   INT             NULL                     COMMENT '구간 수',
    PARAMETER_JSON  TEXT            NULL                     COMMENT '도면 파라미터 JSON',
    STATUS          VARCHAR(20)     NOT NULL DEFAULT 'DRAFT' COMMENT '도면 상태 (DRAFT/IN_REVIEW/APPROVED/RELEASED/OBSOLETE)',
    CURRENT_VERSION INT             NULL     DEFAULT 1       COMMENT '현재 버전 번호',
    CREATED_BY      VARCHAR(50)     NULL                     COMMENT '생성자 ID',
    CREATED_AT      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    UPDATED_BY      VARCHAR(50)     NULL                     COMMENT '수정자 ID',
    UPDATED_AT      DATETIME        NULL                     COMMENT '수정일시',
    DELETED_YN      CHAR(1)         NOT NULL DEFAULT 'N'     COMMENT '삭제 여부 (Y/N)',
    PRIMARY KEY (DRAWING_ID),
    UNIQUE KEY UK_DRAWING_NO (DRAWING_NO)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='도면 마스터 테이블';

-- 도면 상태 인덱스
CREATE INDEX IDX_DRAWING_STATUS ON drawing (STATUS, DELETED_YN);
CREATE INDEX IDX_DRAWING_CREATED_AT ON drawing (CREATED_AT);


-- 도면 버전 테이블
CREATE TABLE IF NOT EXISTS drawing_version (
    VERSION_ID          BIGINT          NOT NULL AUTO_INCREMENT  COMMENT '버전 ID (PK)',
    DRAWING_ID          BIGINT          NOT NULL                 COMMENT '도면 ID (FK)',
    VERSION_NO          INT             NOT NULL                 COMMENT '버전 번호',
    CHANGE_DESCRIPTION  VARCHAR(500)    NULL                     COMMENT '변경 사유',
    SVG_DATA            LONGTEXT        NULL                     COMMENT 'SVG 도면 데이터',
    PARAMETER_SNAPSHOT  LONGTEXT        NULL                     COMMENT '파라미터 스냅샷 (JSON)',
    CREATED_BY          VARCHAR(50)     NULL                     COMMENT '생성자 ID',
    CREATED_AT          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    PRIMARY KEY (VERSION_ID),
    CONSTRAINT FK_VERSION_DRAWING FOREIGN KEY (DRAWING_ID) REFERENCES drawing (DRAWING_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='도면 버전 이력 테이블';

-- 도면+버전 복합 인덱스
CREATE UNIQUE INDEX UQ_DRAWING_VERSION ON drawing_version (DRAWING_ID, VERSION_NO);
CREATE INDEX IDX_VERSION_CREATED_AT ON drawing_version (CREATED_AT);


-- PDF 출력 이력 테이블
CREATE TABLE IF NOT EXISTS pdf_export_log (
    EXPORT_ID       BIGINT          NOT NULL AUTO_INCREMENT  COMMENT '출력 ID (PK)',
    DRAWING_ID      BIGINT          NOT NULL                 COMMENT '도면 ID (FK)',
    VERSION_NO      INT             NOT NULL                 COMMENT '출력 버전 번호',
    FILE_NAME       VARCHAR(300)    NOT NULL                 COMMENT '출력 파일명',
    FILE_PATH       VARCHAR(500)    NULL                     COMMENT '파일 저장 경로',
    FILE_SIZE       BIGINT          NULL                     COMMENT '파일 크기 (bytes)',
    EXPORT_STATUS   VARCHAR(20)     NOT NULL DEFAULT 'PENDING' COMMENT '출력 상태 (PENDING/SUCCESS/FAILED)',
    ERROR_MESSAGE   VARCHAR(1000)   NULL                     COMMENT '오류 메시지',
    EXPORTED_BY     VARCHAR(50)     NULL                     COMMENT '출력자 ID',
    EXPORTED_AT     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '출력일시',
    PRIMARY KEY (EXPORT_ID),
    CONSTRAINT FK_EXPORT_DRAWING FOREIGN KEY (DRAWING_ID) REFERENCES drawing (DRAWING_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='PDF 출력 이력 테이블';

-- 출력 이력 인덱스
CREATE INDEX IDX_EXPORT_DRAWING ON pdf_export_log (DRAWING_ID);
CREATE INDEX IDX_EXPORT_EXPORTED_AT ON pdf_export_log (EXPORTED_AT);
CREATE INDEX IDX_EXPORT_EXPORTED_BY ON pdf_export_log (EXPORTED_BY);
