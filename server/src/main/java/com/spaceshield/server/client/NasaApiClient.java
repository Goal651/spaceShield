package com.spaceshield.server.client;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.spaceshield.server.client.response.fireball.FireballResponse;
import com.spaceshield.server.client.response.neo.NeoFeedResponse;
import com.spaceshield.server.client.response.solar.SolarFlareResponse;
import com.spaceshield.server.dtos.fireball.FireballDto;
import com.spaceshield.server.dtos.solar.SolarFlareDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NasaApiClient {
    private final WebClient webClient;

    private final NasaProperties nasaProperties;

    public NeoFeedResponse getAsteroidsRaw() {

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/neo/rest/v1/feed")
                        .queryParam("start_date", LocalDate.now())
                        .queryParam("api_key", nasaProperties.getApiKey())
                        .build())
                .retrieve()
                .bodyToMono(NeoFeedResponse.class)
                .block();
    }

    public SolarFlareResponse getSolarFlares() {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/DONKI/FLR")
                        .queryParam("api_key", nasaProperties.getApiKey())
                        .build())
                .retrieve()
                .bodyToMono(SolarFlareResponse.class)
                .block();
    }

    public FireballResponse getFireballs() {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/fireball.api")
                        .queryParam("api_key", nasaProperties.getApiKey())
                        .build())
                .retrieve()
                .bodyToMono(FireballResponse.class)
                .block();
    }
}
