package com.spaceshield.server.scheduler;

import java.time.LocalDate;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.spaceshield.server.client.NasaApiClient;
import com.spaceshield.server.client.response.NearEarthObjectDto;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;

@Component
@RequiredArgsConstructor
public class AsteroidScheduler {

    private final NasaApiClient nasaApiClient;

    @Scheduled(fixedRate = 3000)
    public void fetchAsteroids() {
        LocalDate today = LocalDate.now();
        String startDate = today.toString();
        String endDate = today.plusDays(7).toString();

        Flux<NearEarthObjectDto> neos = nasaApiClient.getNeoFeed(startDate, endDate);

        neos.subscribe(neo -> {
            System.out.println("Neo Data");
            System.out.println(neo);
        });
    }
}
