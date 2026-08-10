package com.company.module.autodrawing.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * JSON 파일 기반 데이터 저장소 — 기존 Express 앱의 data/ 구조를 그대로 유지
 */
@Slf4j
@Component
public class JsonFileStore {

    private final ObjectMapper objectMapper;
    private final Path dataDir;

    public JsonFileStore(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        // 프로젝트 루트의 data/ 디렉토리 사용 (기존 Express 앱과 동일)
        String appDir = System.getProperty("app.data.dir",
                System.getProperty("user.dir") + "/data");
        this.dataDir = Paths.get(appDir);
        ensureDir(dataDir);
        log.info("[JsonFileStore] Data directory: {}", dataDir.toAbsolutePath());
    }

    private void ensureDir(Path dir) {
        try {
            Files.createDirectories(dir);
        } catch (IOException e) {
            log.error("Failed to create directory: {}", dir, e);
        }
    }

    public <T> T loadJSON(Path filePath, TypeReference<T> typeRef, T fallback) {
        try {
            if (Files.exists(filePath)) {
                return objectMapper.readValue(filePath.toFile(), typeRef);
            }
        } catch (IOException e) {
            log.error("[JsonFileStore] Failed to load {}: {}", filePath, e.getMessage());
        }
        return fallback;
    }

    public void saveJSON(Path filePath, Object data) {
        try {
            ensureDir(filePath.getParent());
            objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValue(filePath.toFile(), data);
        } catch (IOException e) {
            log.error("[JsonFileStore] Failed to save {}: {}", filePath, e.getMessage());
        }
    }

    // ── 사용자 DB ──
    public List<Map<String, Object>> loadUsers() {
        return loadJSON(dataDir.resolve("users.json"),
                new TypeReference<>() {}, Collections.emptyList());
    }

    public void saveUsers(List<Map<String, Object>> users) {
        saveJSON(dataDir.resolve("users.json"), users);
    }

    public List<Map<String, Object>> loadTeams() {
        return loadJSON(dataDir.resolve("teams.json"),
                new TypeReference<>() {}, Collections.emptyList());
    }

    public void saveTeams(List<Map<String, Object>> teams) {
        saveJSON(dataDir.resolve("teams.json"), teams);
    }

    // ── 팀별 프로젝트 ──
    public Path getTeamProjectsFile(String teamId) {
        return dataDir.resolve(teamId).resolve("projects.json");
    }

    public List<Map<String, Object>> loadTeamProjects(String teamId) {
        return loadJSON(getTeamProjectsFile(teamId),
                new TypeReference<>() {}, Collections.emptyList());
    }

    public void saveTeamProjects(String teamId, List<Map<String, Object>> projects) {
        saveJSON(getTeamProjectsFile(teamId), projects);
    }

    /**
     * 저장 전 기존 파일을 타임스탬프 백업 (롤백 안전장치)
     */
    public String backupTeamProjects(String teamId, String reason) {
        Path fpath = getTeamProjectsFile(teamId);
        if (!Files.exists(fpath)) return null;

        Path backupDir = dataDir.resolve(teamId).resolve("backups");
        ensureDir(backupDir);

        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH-mm-ss"));
        String filename = "projects-" + ts + (reason != null ? "-" + reason : "") + ".json";
        Path bpath = backupDir.resolve(filename);

        try {
            Files.copy(fpath, bpath, StandardCopyOption.REPLACE_EXISTING);

            // 백업은 최근 20개만 유지
            File[] backups = backupDir.toFile().listFiles((dir, name) -> name.startsWith("projects-"));
            if (backups != null && backups.length > 20) {
                java.util.Arrays.sort(backups);
                for (int i = 0; i < backups.length - 20; i++) {
                    backups[i].delete();
                }
            }
            return bpath.toString();
        } catch (IOException e) {
            log.error("[DB] Backup failed for team {}: {}", teamId, e.getMessage());
            return null;
        }
    }

    public Path getDataDir() {
        return dataDir;
    }
}
