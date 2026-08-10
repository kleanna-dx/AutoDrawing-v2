-- ============================================================
-- AutoDrawing Module - Seed Data
-- 개발/테스트용 초기 데이터
-- ============================================================

-- 샘플 도면 데이터
INSERT INTO drawing (DRAWING_NAME, DRAWING_NO, DESCRIPTION, SHAFT_DIAMETER, SHAFT_LENGTH, SECTION_COUNT, STATUS, CURRENT_VERSION, CREATED_BY, CREATED_AT, UPDATED_AT, DELETED_YN)
VALUES
    ('전동기 축 도면', 'DRW-2024-001', '전동기 축 기본 설계 도면 (KS B 2023 베어링 적용)', 45.0, 280.0, 5, 'RELEASED', 3, 'admin', NOW(), NOW(), 'N'),
    ('감속기 입력축', 'DRW-2024-002', '감속기 입력축 도면 (키홈 KS B 1311 적용)', 35.0, 200.0, 4, 'APPROVED', 2, 'admin', NOW(), NOW(), 'N'),
    ('펌프 구동축', 'DRW-2024-003', '펌프 구동축 설계 (스냅링 KS B 1336 적용)', 50.0, 350.0, 6, 'DRAFT', 1, 'admin', NOW(), NOW(), 'N');

-- 샘플 버전 데이터
INSERT INTO drawing_version (DRAWING_ID, VERSION_NO, CHANGE_DESCRIPTION, CREATED_BY, CREATED_AT)
VALUES
    (1, 1, '초기 버전 생성', 'admin', NOW()),
    (1, 2, '베어링 위치 조정 (구간 2,4)', 'admin', NOW()),
    (1, 3, '스냅링 추가 및 키홈 규격 변경', 'admin', NOW()),
    (2, 1, '초기 버전 생성', 'admin', NOW()),
    (2, 2, '축 직경 변경 및 나사 피치 수정', 'admin', NOW()),
    (3, 1, '초기 버전 생성', 'admin', NOW());

-- 샘플 PDF 출력 이력
INSERT INTO pdf_export_log (DRAWING_ID, VERSION_NO, FILE_NAME, FILE_PATH, FILE_SIZE, EXPORT_STATUS, EXPORTED_BY, EXPORTED_AT)
VALUES
    (1, 3, 'DRW-2024-001_v3.pdf', '/exports/DRW-2024-001_v3.pdf', 245760, 'SUCCESS', 'admin', NOW()),
    (1, 2, 'DRW-2024-001_v2.pdf', '/exports/DRW-2024-001_v2.pdf', 230400, 'SUCCESS', 'admin', NOW()),
    (2, 2, 'DRW-2024-002_v2.pdf', '/exports/DRW-2024-002_v2.pdf', 189440, 'SUCCESS', 'admin', NOW()),
    (3, 1, 'DRW-2024-003_v1.pdf', NULL, NULL, 'FAILED', 'admin', NOW());
