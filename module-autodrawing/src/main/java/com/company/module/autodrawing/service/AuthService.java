package com.company.module.autodrawing.service;

import com.company.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 인증 서비스 — 기존 Express auth-server.js 로직을 그대로 변환
 * - JSON 파일 기반 사용자/팀 관리
 * - 메모리 세션 저장소
 * - bcrypt 비밀번호 해싱
 * - 팀별 DB 분리
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final JsonFileStore store;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

    // 메모리 세션 저장소 (기존 Express와 동일)
    private final Map<String, SessionData> sessions = new ConcurrentHashMap<>();

    public static class SessionData {
        public String userId;
        public long createdAt;
        public String activeTeamId;

        public SessionData(String userId) {
            this.userId = userId;
            this.createdAt = System.currentTimeMillis();
            this.activeTeamId = null;
        }
    }

    /**
     * 초기화: 기본 계정 생성 (기존 initDefaults 그대로)
     */
    public void initDefaults() {
        List<Map<String, Object>> teams = store.loadTeams();
        if (teams.isEmpty()) {
            teams = new ArrayList<>();
            teams.add(createTeamMap("master", "Master", "시스템 관리자"));
            teams.add(createTeamMap("gongmu", "공무팀", "공무팀 전용"));
            store.saveTeams(teams);
            log.info("[Auth] Default teams created: master, 공무팀");
        }

        List<Map<String, Object>> users = store.loadUsers();
        if (users.isEmpty()) {
            users = new ArrayList<>();
            users.add(createUserMap("hmlee2", "관리자", passwordEncoder.encode("kleannara12#"), "master", "master"));
            users.add(createUserMap("Gongmu", "공무팀", passwordEncoder.encode("kleannara12#"), "team", "gongmu"));
            store.saveUsers(users);
            log.info("[Auth] Default users created: hmlee2 (master), Gongmu (공무팀)");
        }

        // 기존 projects.json → 공무팀 DB로 마이그레이션
        var oldFile = store.getDataDir().resolve("projects.json");
        var gongmuFile = store.getTeamProjectsFile("gongmu");
        if (Files.exists(oldFile) && !Files.exists(gongmuFile)) {
            try {
                Files.createDirectories(gongmuFile.getParent());
                Files.copy(oldFile, gongmuFile);
                log.info("[Auth] Migrated existing projects.json → data/gongmu/projects.json");
            } catch (Exception e) {
                log.error("[Auth] Migration failed: {}", e.getMessage());
            }
        }
    }

    // ── 로그인 ──
    public Map<String, Object> login(String userId, String password) {
        if (userId == null || password == null) {
            throw new BusinessException(400, "ID와 비밀번호를 입력하세요.");
        }

        List<Map<String, Object>> users = store.loadUsers();
        Map<String, Object> user = users.stream()
                .filter(u -> userId.equals(u.get("id")))
                .findFirst()
                .orElseThrow(() -> new BusinessException(401, "존재하지 않는 계정입니다."));

        // bcryptjs(Node.js)는 $2b$ 해시를 생성하지만 Spring BCryptPasswordEncoder는 $2a$만 인식
        // $2b$와 $2a$는 알고리즘적으로 동일하므로 prefix만 치환하여 호환성 확보
        String storedHash = (String) user.get("password");
        if (storedHash != null && storedHash.startsWith("$2b$")) {
            storedHash = "$2a$" + storedHash.substring(4);
        }
        if (!passwordEncoder.matches(password, storedHash)) {
            throw new BusinessException(401, "비밀번호가 일치하지 않습니다.");
        }

        String sessionId = UUID.randomUUID().toString();
        SessionData session = new SessionData(userId);
        session.activeTeamId = (String) user.get("teamId");
        sessions.put(sessionId, session);

        List<Map<String, Object>> teams = store.loadTeams();
        String teamId = (String) user.get("teamId");
        String teamName = teams.stream()
                .filter(t -> teamId.equals(t.get("id")))
                .map(t -> (String) t.get("name"))
                .findFirst().orElse(teamId);

        log.info("[Auth] Login: {} ({}/{})", userId, user.get("role"), teamName);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("sessionId", sessionId);
        Map<String, Object> userInfo = new LinkedHashMap<>();
        userInfo.put("id", user.get("id"));
        userInfo.put("name", user.get("name"));
        userInfo.put("role", user.get("role"));
        userInfo.put("teamId", teamId);
        userInfo.put("teamName", teamName);
        result.put("user", userInfo);
        return result;
    }

    // ── 로그아웃 ──
    public void logout(String sessionId) {
        if (sessionId != null) {
            sessions.remove(sessionId);
            log.info("[Auth] Logout session: {}...", sessionId.substring(0, Math.min(8, sessionId.length())));
        }
    }

    // ── 세션 확인 ──
    public SessionData getSession(String sessionId) {
        return sessionId != null ? sessions.get(sessionId) : null;
    }

    public Map<String, Object> getUser(String userId) {
        return store.loadUsers().stream()
                .filter(u -> userId.equals(u.get("id")))
                .findFirst().orElse(null);
    }

    public Map<String, Object> getSessionInfo(String sessionId) {
        SessionData session = getSession(sessionId);
        if (session == null) throw new BusinessException(401, "로그인이 필요합니다.");

        Map<String, Object> user = getUser(session.userId);
        if (user == null) throw new BusinessException(401, "사용자를 찾을 수 없습니다.");

        List<Map<String, Object>> teams = store.loadTeams();
        String teamId = (String) user.get("teamId");
        String teamName = findTeamName(teams, teamId);
        String activeTeamName = findTeamName(teams, session.activeTeamId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        Map<String, Object> userInfo = new LinkedHashMap<>();
        userInfo.put("id", user.get("id"));
        userInfo.put("name", user.get("name"));
        userInfo.put("role", user.get("role"));
        userInfo.put("teamId", teamId);
        userInfo.put("teamName", teamName);
        userInfo.put("activeTeamId", session.activeTeamId);
        userInfo.put("activeTeamName", activeTeamName);
        result.put("user", userInfo);
        return result;
    }

    // ── 팀 전환 ──
    public Map<String, Object> switchTeam(String sessionId, String teamId) {
        SessionData session = requireSession(sessionId);
        Map<String, Object> user = requireUser(session.userId);

        if (!"master".equals(user.get("role")) && !teamId.equals(user.get("teamId"))) {
            throw new BusinessException(403, "권한이 없습니다.");
        }

        List<Map<String, Object>> teams = store.loadTeams();
        String teamName = teams.stream()
                .filter(t -> teamId.equals(t.get("id")))
                .map(t -> (String) t.get("name"))
                .findFirst()
                .orElseThrow(() -> new BusinessException(404, "팀을 찾을 수 없습니다."));

        session.activeTeamId = teamId;
        log.info("[Auth] Team switch: {} → {}", session.userId, teamName);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("teamId", teamId);
        result.put("teamName", teamName);
        return result;
    }

    // ── 팀 CRUD ──
    public Map<String, Object> getTeams(String sessionId) {
        SessionData session = requireSession(sessionId);
        Map<String, Object> user = requireUser(session.userId);
        List<Map<String, Object>> teams = store.loadTeams();

        List<Map<String, Object>> filtered;
        if ("master".equals(user.get("role"))) {
            filtered = teams.stream().filter(t -> !"master".equals(t.get("id"))).toList();
        } else {
            filtered = teams.stream().filter(t -> user.get("teamId").equals(t.get("id"))).toList();
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("teams", filtered);
        return result;
    }

    public Map<String, Object> createTeam(String sessionId, String id, String name, String description) {
        requireMaster(sessionId);
        if (id == null || name == null) throw new BusinessException(400, "ID와 이름을 입력하세요.");

        List<Map<String, Object>> teams = store.loadTeams();
        if (teams.stream().anyMatch(t -> id.equals(t.get("id")))) {
            throw new BusinessException(409, "이미 존재하는 팀 ID입니다.");
        }

        teams.add(createTeamMap(id, name, description != null ? description : ""));
        store.saveTeams(teams);

        // 팀 DB 디렉토리 생성
        store.saveTeamProjects(id, new ArrayList<>());

        log.info("[Auth] Team created: {} ({})", id, name);
        return Map.of("success", true);
    }

    public Map<String, Object> deleteTeam(String sessionId, String teamId) {
        requireMaster(sessionId);
        if ("master".equals(teamId) || "gongmu".equals(teamId)) {
            throw new BusinessException(400, "기본 팀은 삭제할 수 없습니다.");
        }

        List<Map<String, Object>> teams = new ArrayList<>(store.loadTeams());
        teams.removeIf(t -> teamId.equals(t.get("id")));
        store.saveTeams(teams);
        log.info("[Auth] Team deleted: {}", teamId);
        return Map.of("success", true);
    }

    // ── 사용자 CRUD ──
    public Map<String, Object> getUsers(String sessionId) {
        requireMaster(sessionId);
        List<Map<String, Object>> users = store.loadUsers();
        List<Map<String, Object>> teams = store.loadTeams();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> u : users) {
            Map<String, Object> info = new LinkedHashMap<>();
            info.put("id", u.get("id"));
            info.put("name", u.get("name"));
            info.put("role", u.get("role"));
            info.put("teamId", u.get("teamId"));
            info.put("createdAt", u.get("createdAt"));
            info.put("teamName", findTeamName(teams, (String) u.get("teamId")));
            result.add(info);
        }

        return Map.of("success", true, "users", result);
    }

    public Map<String, Object> createUser(String sessionId, String id, String name, String password, String teamId) {
        requireMaster(sessionId);
        if (id == null || password == null || teamId == null) {
            throw new BusinessException(400, "필수 항목을 입력하세요.");
        }

        List<Map<String, Object>> users = new ArrayList<>(store.loadUsers());
        if (users.stream().anyMatch(u -> id.equals(u.get("id")))) {
            throw new BusinessException(409, "이미 존재하는 사용자 ID입니다.");
        }

        List<Map<String, Object>> teams = store.loadTeams();
        if (teams.stream().noneMatch(t -> teamId.equals(t.get("id")))) {
            throw new BusinessException(400, "존재하지 않는 팀입니다.");
        }

        users.add(createUserMap(id, name != null ? name : id, passwordEncoder.encode(password), "team", teamId));
        store.saveUsers(users);
        log.info("[Auth] User created: {} → {}", id, teamId);
        return Map.of("success", true);
    }

    public Map<String, Object> updateUser(String sessionId, String userId, String name, String password, String teamId) {
        requireMaster(sessionId);
        List<Map<String, Object>> users = new ArrayList<>(store.loadUsers());
        Map<String, Object> user = users.stream()
                .filter(u -> userId.equals(u.get("id")))
                .findFirst()
                .orElseThrow(() -> new BusinessException(404, "사용자를 찾을 수 없습니다."));

        if ("master".equals(user.get("role"))) {
            throw new BusinessException(400, "Master 계정은 수정할 수 없습니다.");
        }

        if (name != null) user.put("name", name);
        if (password != null) user.put("password", passwordEncoder.encode(password));
        if (teamId != null) {
            List<Map<String, Object>> teams = store.loadTeams();
            if (teams.stream().noneMatch(t -> teamId.equals(t.get("id")))) {
                throw new BusinessException(400, "존재하지 않는 팀입니다.");
            }
            user.put("teamId", teamId);
        }
        store.saveUsers(users);
        log.info("[Auth] User updated: {}", userId);
        return Map.of("success", true);
    }

    public Map<String, Object> deleteUser(String sessionId, String userId) {
        requireMaster(sessionId);
        List<Map<String, Object>> users = new ArrayList<>(store.loadUsers());
        Map<String, Object> user = users.stream()
                .filter(u -> userId.equals(u.get("id")))
                .findFirst()
                .orElseThrow(() -> new BusinessException(404, "사용자를 찾을 수 없습니다."));

        if ("master".equals(user.get("role"))) {
            throw new BusinessException(400, "Master 계정은 삭제할 수 없습니다.");
        }

        users.removeIf(u -> userId.equals(u.get("id")));
        store.saveUsers(users);
        log.info("[Auth] User deleted: {}", userId);
        return Map.of("success", true);
    }

    // ── 내부 헬퍼 ──
    public SessionData requireSession(String sessionId) {
        SessionData session = getSession(sessionId);
        if (session == null) throw new BusinessException(401, "로그인이 필요합니다.");
        return session;
    }

    public Map<String, Object> requireUser(String userId) {
        Map<String, Object> user = getUser(userId);
        if (user == null) throw new BusinessException(401, "사용자를 찾을 수 없습니다.");
        return user;
    }

    private void requireMaster(String sessionId) {
        SessionData session = requireSession(sessionId);
        Map<String, Object> user = requireUser(session.userId);
        if (!"master".equals(user.get("role"))) {
            throw new BusinessException(403, "마스터 권한이 필요합니다.");
        }
    }

    private String findTeamName(List<Map<String, Object>> teams, String teamId) {
        return teams.stream()
                .filter(t -> teamId != null && teamId.equals(t.get("id")))
                .map(t -> (String) t.get("name"))
                .findFirst().orElse(teamId);
    }

    private Map<String, Object> createTeamMap(String id, String name, String description) {
        Map<String, Object> team = new LinkedHashMap<>();
        team.put("id", id);
        team.put("name", name);
        team.put("description", description);
        team.put("createdAt", Instant.now().toString());
        return team;
    }

    private Map<String, Object> createUserMap(String id, String name, String passwordHash, String role, String teamId) {
        Map<String, Object> user = new LinkedHashMap<>();
        user.put("id", id);
        user.put("name", name);
        user.put("password", passwordHash);
        user.put("role", role);
        user.put("teamId", teamId);
        user.put("createdAt", Instant.now().toString());
        return user;
    }
}
