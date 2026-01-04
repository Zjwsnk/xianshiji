package com.sixspirits.xianshiji.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // 允许所有源，用于开发环境（生产环境应限制特定域名）
        config.addAllowedOriginPattern("*");
        
        // 允许的方法：所有 HTTP 方法
        config.addAllowedMethod("*");
        
        // 允许的头部：所有头部
        config.addAllowedHeader("*");
        
        // 允许凭证（如 cookies）
        config.setAllowCredentials(true);
        
        // 预检请求的缓存时间（秒）
        config.setMaxAge(3600L);
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
