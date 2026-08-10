package com.company.module.autodrawing.controller;

import com.company.module.autodrawing.service.AuthService;
import com.company.module.autodrawing.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 프로젝트(도면) API 컨트롤러 — 기존 Express /api/projects 그대로
 */
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final AuthService authService;
    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProjects(
            @RequestHeader("x-session-id") String sessionId) {
        AuthService.SessionData session = authService.requireSession(sessionId);
        String teamId = session.activeTeamId != null ? session.activeTeamId
                : (String) authService.requireUser(session.userId).get("teamId");
        return ResponseEntity.ok(projectService.getProjects(teamId));
    }

    @PostMapping
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> saveProjects(
            @RequestHeader("x-session-id") String sessionId,
            @RequestBody Map<String, Object> body) {
        AuthService.SessionData session = authService.requireSession(sessionId);
        String teamId = session.activeTeamId != null ? session.activeTeamId
                : (String) authService.requireUser(session.userId).get("teamId");

        List<Map<String, Object>> projects = (List<Map<String, Object>>) body.get("projects");
        boolean force = Boolean.TRUE.equals(body.get("force"));

        return ResponseEntity.ok(projectService.saveProjects(teamId, projects, force));
    }
}
