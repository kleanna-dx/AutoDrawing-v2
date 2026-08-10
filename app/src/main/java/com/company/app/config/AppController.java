package com.company.app.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * 기존 Express의 GET /app → index.html (빌드ID 치환) 로직 구현
 */
@Slf4j
@RestController
public class AppController {

    // 서버 시작 시 고유 빌드 ID 생성 (기존 Express BUILD_ID와 동일)
    private static final String BUILD_ID = Long.toString(System.currentTimeMillis(), 36);

    static {
        System.out.println("[server] BUILD_ID = " + BUILD_ID);
    }

    @GetMapping("/app")
    public void serveApp(HttpServletResponse response) throws IOException {
        response.setContentType(MediaType.TEXT_HTML_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");

        ClassPathResource resource = new ClassPathResource("static/index.html");
        String html = resource.getContentAsString(StandardCharsets.UTF_8);

        // js/xxx.js?v=170 → ?v=<BUILD_ID> (기존 Express 로직 그대로)
        html = html.replaceAll("\\?v=[0-9a-zA-Z]+", "?v=" + BUILD_ID);

        response.getWriter().write(html);
    }
}
