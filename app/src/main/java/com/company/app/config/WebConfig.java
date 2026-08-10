package com.company.app.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.ResourceResolver;
import org.springframework.web.servlet.resource.ResourceResolverChain;

import java.util.List;

/**
 * Web MVC 설정
 * - / → /login.html 리다이렉트 (기존 Express 동일)
 * - /app → index.html 서빙 (기존 Express 동일)
 * - 정적 파일 서빙 + 캐시 헤더 설정
 */
@Slf4j
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // GET / → redirect to /login.html (기존 Express: res.redirect('/login.html'))
        registry.addRedirectViewController("/", "/login.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // JS/CSS/HTML — no-cache (기존 Express setHeaders와 동일)
        registry.addResourceHandler("/js/**", "/css/**", "/*.html")
                .addResourceLocations("classpath:/static/js/", "classpath:/static/css/", "classpath:/static/")
                .setCacheControl(CacheControl.noCache().mustRevalidate());

        // 기타 정적 파일
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.noCache());
    }
}
