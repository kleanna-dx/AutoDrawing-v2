package com.company.app;

import com.company.module.autodrawing.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;

@Slf4j
@SpringBootApplication
@ComponentScan(basePackages = {"com.company.app", "com.company.module.autodrawing", "com.company.core"})
public class AutodrawingApplication {

    public static void main(String[] args) {
        SpringApplication.run(AutodrawingApplication.class, args);
    }

    /**
     * 서버 시작 시 기본 계정/팀 초기화 (기존 Express initDefaults 대응)
     */
    @Bean
    CommandLineRunner initAuth(AuthService authService) {
        return args -> {
            authService.initDefaults();
            log.info("[Server] AutoDrawing Spring Boot server initialized");
        };
    }
}
