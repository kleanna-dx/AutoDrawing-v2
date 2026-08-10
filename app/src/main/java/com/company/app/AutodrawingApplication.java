package com.company.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * AutoDrawing Platform - Spring Boot Application
 * 도면 관리 플랫폼 메인 애플리케이션
 */
@SpringBootApplication(scanBasePackages = {
        "com.company.app",
        "com.company.module.autodrawing"
})
@EntityScan(basePackages = "com.company.module.autodrawing.entity")
@EnableJpaRepositories(basePackages = "com.company.module.autodrawing.repository")
public class AutodrawingApplication {

    public static void main(String[] args) {
        SpringApplication.run(AutodrawingApplication.class, args);
    }
}
