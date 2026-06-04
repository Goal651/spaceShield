package com.spaceshield.server.client;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.spaceshield.server.dtos.asteroid.AsteroidDto;
import com.spaceshield.server.dtos.fireball.FireballDto;
import com.spaceshield.server.dtos.solar.SolarFlareDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NasaApiClient {
    private final WebClient webClient;

    public List<AsteroidDto> getAsteroids(){
        return webClient.get()
                .uri("/neo/rest/v1/feed")
                .retrieve()
                .bodyToFlux(AsteroidDto.class)
                .collectList()
                .block();
    };

    public List<SolarFlareDto> getSolarFlares(){
        return webClient.get()
                .uri("/space-weather/solar-flares")
                .retrieve()
                .bodyToFlux(SolarFlareDto.class)
                .collectList()
                .block();
    }

    public List<FireballDto> getFireballs(){
        return webClient.get()
                .uri("/space-weather/fireballs")
                .retrieve()
                .bodyToFlux(FireballDto.class)
                .collectList()
                .block();
    }
}
