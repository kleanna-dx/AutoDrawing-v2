package com.company.module.autodrawing.controller;

import com.company.module.autodrawing.service.AuthService;
import com.company.module.autodrawing.service.VisionAnalyzeService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Vision AI 분석 컨트롤러 — 기존 Express POST /api/analyze 그대로
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnalyzeController {

    private final AuthService authService;
    private final VisionAnalyzeService visionService;

    @PostMapping("/analyze")
    public ResponseEntity<?> analyze(
            @RequestHeader("x-session-id") String sessionId,
            @RequestParam("image") MultipartFile image) {
        // 인증 확인
        authService.requireSession(sessionId);

        if (image.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "No image file provided"));
        }

        try {
            JsonNode result = visionService.analyze(
                    image.getBytes(),
                    image.getContentType(),
                    image.getOriginalFilename());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("[API] Analyze error: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Internal server error"));
        }
    }
}
