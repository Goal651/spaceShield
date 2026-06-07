package com.spaceshield.server.scheduler;

import com.spaceshield.server.client.NasaApiClient;
import com.spaceshield.server.service.CoreProcessor;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Slf4j
@Component
@RequiredArgsConstructor
public class SpaceIngestionScheduler {

    private final NasaApiClient client;
    private final CoreProcessor processor;
    private final IngestionMapper mapper;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // ── Run all ingestions once on startup ──────────────────────────────
    @PostConstruct
    public void onStartup() {
        log.info("=== Running initial data ingestion on startup ===");
        ingestAsteroids();
        ingestSolarFlares();
        ingestFireballs();
    }

    // ── Asteroids: pull once per day (NASA NEO feed is daily) ───────────────
    @Scheduled(initialDelay = 10000, cron = "0 0 6 * * *") // 06:00 every day
    public void ingestAsteroids() {
        String today = LocalDate.now().format(DATE_FMT);
        String tomorrow = LocalDate.now().plusDays(1).format(DATE_FMT);

        log.info("Ingesting NEO feed {} → {}", today, tomorrow);

        client.getNeoFeed(today, tomorrow)
                .map(mapper::toAsteroidEvent)
                .doOnNext(processor::processAsteroidData)
                .doOnError(ex -> log.error("NEO ingestion failed: {}", ex.getMessage()))
                .subscribe();
    }

    // ── Solar flares: pull every 30 minutes (space weather changes fast) ────
    @Scheduled(initialDelay = 20000, fixedRate = 1_800_000)
    public void ingestSolarFlares() {
        String startDate = LocalDate.now().minusDays(1).format(DATE_FMT);
        String endDate = LocalDate.now().format(DATE_FMT);

        log.info("Ingesting DONKI solar flares {} → {}", startDate, endDate);

        client.getSolarFlares(startDate, endDate)
                .map(mapper::toSolarFlareEvent)
                .doOnNext(processor::processSolarData)
                .doOnError(ex -> log.error("Solar flare ingestion failed: {}", ex.getMessage()))
                .subscribe();
    }

    // ── Fireballs: pull every 6 hours (CNEOS updates irregularly) ───────────
    @Scheduled(initialDelay = 30000, fixedRate = 21_600_000)
    public void ingestFireballs() {
        String dateMin = LocalDate.now().minusDays(7).format(DATE_FMT);

        log.info("Ingesting CNEOS fireballs since {}", dateMin);

        client.getFireballs(dateMin, 50)
                .map(mapper::toFireballEvent)
                .doOnNext(processor::processFireballData)
                .doOnError(ex -> log.error("Fireball ingestion failed: {}", ex.getMessage()))
                .subscribe();
    }
}
