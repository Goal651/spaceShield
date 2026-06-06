package com.spaceshield.server.scheduler;

import java.time.LocalDate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.spaceshield.server.client.NasaApiClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class AsteroidScheduler {

    private final NasaApiClient nasaApiClient;

    @Scheduled(fixedRate = 300000) // 5 minutes in milliseconds
    public void fetchAsteroids() {
        String today = LocalDate.now().toString();
        String nextWeek = LocalDate.now().plusDays(7).toString();

        log.info("Fetching NASA Asteroid Feed from {} to {}", today, nextWeek);

        nasaApiClient.getNeoFeed(today, nextWeek)
                .doOnNext(neo -> log.info("Neo Data: Name={}, Hazardous={}", neo.name(), neo.isPotentiallyHazardous()))
                .subscribe();
    }
}