package com.spaceshield.server.client;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Data;

@ConfigurationProperties(prefix = "nasa")
@Data
public class NasaProperties {

    private String apiKey;

    private String baseUrl;
}