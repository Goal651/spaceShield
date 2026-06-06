package com.spaceshield.server.client;

import com.spaceshield.server.client.response.FireballDto;
import com.spaceshield.server.client.response.FireballResponseDto;
import com.spaceshield.server.client.response.SolarFlareDto;

import lombok.RequiredArgsConstructor;

import com.spaceshield.server.client.response.NearEarthObjectDto;
import com.spaceshield.server.client.response.NeoFeedResponseDto;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.List;

@Component
@RequiredArgsConstructor
public class NasaApiClient {

        private final WebClient neoClient = WebClient.builder().baseUrl("https://api.nasa.gov").build();
        private final WebClient donkiClient = WebClient.builder().baseUrl("https://api.nasa.gov").build();
        private final WebClient fireballClient = WebClient.builder().baseUrl("https://ssd-api.jpl.nasa.gov").build();
        private final NasaProperties nasaProperties;

        // ── NEO ─────────────────────────────────────────────────────────────────

        /**
         * Fetches asteroids for a date range and flattens them into a single list.
         * NASA returns objects keyed by date — we unwrap that here.
         *
         * @param startDate YYYY-MM-DD
         * @param endDate   YYYY-MM-DD (max 7-day window)
         */
        public Flux<NearEarthObjectDto> getNeoFeed(String startDate, String endDate) {
                return neoClient.get()
                                .uri(uri -> uri
                                                .path("/neo/rest/v1/feed")
                                                .queryParam("start_date", startDate)
                                                .queryParam("end_date", endDate)
                                                .queryParam("api_key", nasaProperties.getApiKey())
                                                .build())
                                .retrieve()
                                .bodyToMono(NeoFeedResponseDto.class)
                                .flatMapMany(response -> Flux.fromIterable(
                                                response.nearEarthObjects()
                                                                .values()
                                                                .stream()
                                                                .flatMap(List::stream)
                                                                .toList()));
        }

        // ── SOLAR FLARE ─────────────────────────────────────────────────────────

        /**
         * Fetches solar flare events from NASA DONKI.
         * Returns array — we emit each as a Flux item.
         *
         * @param startDate YYYY-MM-DD (defaults to 30 days ago if null)
         * @param endDate   YYYY-MM-DD (defaults to today if null)
         */
        public Flux<SolarFlareDto> getSolarFlares(String startDate, String endDate) {
                return donkiClient.get()
                                .uri(uri -> uri
                                                .path("/DONKI/FLR")
                                                .queryParam("startDate", startDate)
                                                .queryParam("endDate", endDate)
                                                .queryParam("api_key", nasaProperties.getApiKey())
                                                .build())
                                .retrieve()
                                .bodyToFlux(SolarFlareDto.class);
        }

        // ── FIREBALL ────────────────────────────────────────────────────────────

        /**
         * Fetches fireball events from NASA JPL CNEOS.
         * No API key required. Response is columnar — FireballDto.fromRow() maps each
         * row.
         *
         * @param dateMin YYYY-MM-DD — only return events on or after this date
         * @param limit   max records to return (pass null for all)
         */
        public Flux<FireballDto> getFireballs(String dateMin, Integer limit) {
                return fireballClient.get()
                                .uri(uri -> {
                                        var builder = uri.path("/fireball.api")
                                                        .queryParam("req-loc", true) // only events with known location
                                                        .queryParam("sort", "-date"); // newest first
                                        if (dateMin != null)
                                                builder.queryParam("date-min", dateMin);
                                        if (limit != null)
                                                builder.queryParam("limit", limit);
                                        return builder.build();
                                })
                                .retrieve()
                                .bodyToMono(FireballResponseDto.class)
                                .flatMapMany(response -> Flux.fromIterable(
                                                response.data().stream()
                                                                .map(row -> FireballDto.fromRow(response.fields(), row))
                                                                .toList()));
        }
}
