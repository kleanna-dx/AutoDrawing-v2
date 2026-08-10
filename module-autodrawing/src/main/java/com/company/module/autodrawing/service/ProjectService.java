package com.company.module.autodrawing.service;

import com.company.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * 프로젝트(도면) 서비스 — 기존 Express의 /api/projects 로직 변환
 * 팀별 JSON 파일 기반 DB 유지
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final JsonFileStore store;

    /**
     * 팀별 프로젝트 목록 조회
     */
    public Map<String, Object> getProjects(String teamId) {
        List<Map<String, Object>> projects = store.loadTeamProjects(teamId);
        log.info("[DB] GET /api/projects (team: {}) → {}개", teamId, projects.size());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("projects", projects);
        return result;
    }

    /**
     * 팀별 프로젝트 저장 — 데이터 손실 방어 로직 포함
     */
    public Map<String, Object> saveProjects(String teamId, List<Map<String, Object>> projects, boolean force) {
        if (projects == null) {
            throw new BusinessException(400, "projects must be an array");
        }

        List<Map<String, Object>> existing = store.loadTeamProjects(teamId);
        int prevCount = existing.size();
        int newCount = projects.size();

        // 데이터 손실 방어: 기존보다 현저히 적으면 거부
        boolean isSuspicious = prevCount >= 3
                && newCount < prevCount
                && (newCount == 0 || newCount <= prevCount / 2)
                && !force;

        if (isSuspicious) {
            log.warn("[DB] ⚠️ 의심스러운 저장 거부 (team: {}): {}개 → {}개. force 플래그 필요.",
                    teamId, prevCount, newCount);

            Map<String, Object> error = new LinkedHashMap<>();
            error.put("error", "suspicious_bulk_delete");
            error.put("message", String.format(
                    "기존 %d개에서 %d개로 급감하여 저장을 차단했습니다. 의도한 삭제라면 force:true 로 다시 요청하세요.",
                    prevCount, newCount));
            error.put("prevCount", prevCount);
            error.put("newCount", newCount);
            throw new BusinessException(409, error.toString()) {
                public Map<String, Object> getErrorData() { return error; }
            };
        }

        // 저장 전 항상 백업
        if (prevCount > 0) {
            store.backupTeamProjects(teamId, force ? "force" : "save");
        }

        store.saveTeamProjects(teamId, projects);
        log.info("[DB] POST /api/projects (team: {}) ← {}개 → {}개 저장{}",
                teamId, prevCount, newCount, force ? " (force)" : "");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("count", newCount);
        return result;
    }
}
