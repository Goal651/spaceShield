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
public class FireballScheduler {
    private final NasaApiClient nasaApiClient;
    private final String today = LocalDate.now().toString();
    private final int limit = 50;

    @Scheduled(fixedRate = 300000)
    public void fetchFireballs() {
        nasaApiClient.getFireballs(today, limit)
                .doOnNext(fireball -> log.info("Fireball Data: Date={}, Latitude={}, Longitude={}",
                        fireball.date(), fireball.lat(), fireball.lon()))
                .subscribe();
    }
}
