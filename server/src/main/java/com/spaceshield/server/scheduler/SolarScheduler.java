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
public class SolarScheduler {
    private final NasaApiClient nasaApiClient;
    private final String today = LocalDate.now().toString();

    @Scheduled(fixedRate = 300000)
    public void fetchSolarEvents() {
        nasaApiClient.getSolarFlares(today, today)
                .doOnNext(solarFlare -> log.info("Solar Flare Data: Flare ID={}, Class Type={}", solarFlare.flrId(),
                        solarFlare.classType()))
                .subscribe();
    }
}
