# AutoDrawing Module - SQL Scripts

## 파일 목록

| 파일명 | 설명 | 실행 순서 |
|--------|------|-----------|
| `01_schema.sql` | DDL 스키마 (테이블, 인덱스, FK) | 1 |
| `02_seed_data.sql` | 초기 데이터 (개발/테스트용) | 2 |

## 테이블 구조

### drawing (도면 마스터)
- `DRAWING_ID` — PK, AUTO_INCREMENT
- `DRAWING_NO` — Unique, 도면번호
- `STATUS` — DRAFT / IN_REVIEW / APPROVED / RELEASED / OBSOLETE
- `DELETED_YN` — 소프트 삭제 (Y/N)

### drawing_version (도면 버전 이력)
- `VERSION_ID` — PK, AUTO_INCREMENT
- `DRAWING_ID` + `VERSION_NO` — Unique 복합키
- `SVG_DATA` — LONGTEXT, SVG 도면 데이터
- `PARAMETER_SNAPSHOT` — LONGTEXT, 파라미터 JSON 스냅샷

### pdf_export_log (PDF 출력 이력)
- `EXPORT_ID` — PK, AUTO_INCREMENT
- `EXPORT_STATUS` — PENDING / SUCCESS / FAILED

## 실행 방법

```bash
# MariaDB에서 실행
mysql -u root -p autodrawing < sql/module-autodrawing/01_schema.sql
mysql -u root -p autodrawing < sql/module-autodrawing/02_seed_data.sql
```

## 플랫폼 통합

`app/build.gradle`에 모듈 의존성 추가 후, SQL 스크립트를 순서대로 실행합니다.
