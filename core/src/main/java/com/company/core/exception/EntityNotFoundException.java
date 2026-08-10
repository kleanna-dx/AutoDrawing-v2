package com.company.core.exception;

/**
 * 엔티티 조회 실패 시 발생하는 예외
 */
public class EntityNotFoundException extends BusinessException {

    public EntityNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }

    public EntityNotFoundException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }

    public EntityNotFoundException(String entityName, Long id) {
        super(ErrorCode.RESOURCE_NOT_FOUND,
                entityName + " (id=" + id + ")를 찾을 수 없습니다.");
    }

    public EntityNotFoundException(String entityName, String identifier) {
        super(ErrorCode.RESOURCE_NOT_FOUND,
                entityName + " (" + identifier + ")를 찾을 수 없습니다.");
    }
}
