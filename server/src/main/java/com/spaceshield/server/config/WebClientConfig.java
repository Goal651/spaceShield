package com.spaceshield.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

import com.spaceshield.server.client.NasaProperties;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class WebClientConfig {

    private final NasaProperties nasaProperties;

    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .baseUrl(nasaProperties.getBaseUrl())
                .defaultHeader("X-RapidAPI-Key", nasaProperties.getApiKey())
                .build();
    }

}