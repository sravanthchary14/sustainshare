package com.sustainshare.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors() // Enable CORS support
            .and()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/donations/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/food/**").permitAll()
                .requestMatchers("/api/users/**").permitAll()
                .requestMatchers("/api/pickups/**").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin()
            .and()
            .httpBasic();

        return http.build();
    }
}
