package com.company.module.autodrawing.controller;

import com.company.module.autodrawing.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 인증 API 컨트롤러 — 기존 Express auth-server.js 라우트 그대로
 * 
 * POST /api/auth/login
 * POST /api/auth/logout
 * GET  /api/auth/session
 * POST /api/auth/switch-team
 * GET  /api/auth/teams
 * POST /api/auth/teams
 * DELETE /api/auth/teams/{teamId}
 * GET  /api/auth/users
 * POST /api/auth/users
 * PUT  /api/auth/users/{userId}
 * DELETE /api/auth/users/{userId}
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        Map<String, Object> result = authService.login(body.get("userId"), body.get("password"));
        return ResponseEntity.ok(result);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@RequestBody Map<String, String> body) {
        authService.logout(body.get("sessionId"));
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/session")
    public ResponseEntity<Map<String, Object>> session(@RequestHeader("x-session-id") String sessionId) {
        return ResponseEntity.ok(authService.getSessionInfo(sessionId));
    }

    @PostMapping("/switch-team")
    public ResponseEntity<Map<String, Object>> switchTeam(
            @RequestHeader("x-session-id") String sessionId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.switchTeam(sessionId, body.get("teamId")));
    }

    @GetMapping("/teams")
    public ResponseEntity<Map<String, Object>> getTeams(@RequestHeader("x-session-id") String sessionId) {
        return ResponseEntity.ok(authService.getTeams(sessionId));
    }

    @PostMapping("/teams")
    public ResponseEntity<Map<String, Object>> createTeam(
            @RequestHeader("x-session-id") String sessionId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.createTeam(sessionId,
                body.get("id"), body.get("name"), body.get("description")));
    }

    @DeleteMapping("/teams/{teamId}")
    public ResponseEntity<Map<String, Object>> deleteTeam(
            @RequestHeader("x-session-id") String sessionId,
            @PathVariable String teamId) {
        return ResponseEntity.ok(authService.deleteTeam(sessionId, teamId));
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUsers(@RequestHeader("x-session-id") String sessionId) {
        return ResponseEntity.ok(authService.getUsers(sessionId));
    }

    @PostMapping("/users")
    public ResponseEntity<Map<String, Object>> createUser(
            @RequestHeader("x-session-id") String sessionId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.createUser(sessionId,
                body.get("id"), body.get("name"), body.get("password"), body.get("teamId")));
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<Map<String, Object>> updateUser(
            @RequestHeader("x-session-id") String sessionId,
            @PathVariable String userId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.updateUser(sessionId, userId,
                body.get("name"), body.get("password"), body.get("teamId")));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, Object>> deleteUser(
            @RequestHeader("x-session-id") String sessionId,
            @PathVariable String userId) {
        return ResponseEntity.ok(authService.deleteUser(sessionId, userId));
    }
}
