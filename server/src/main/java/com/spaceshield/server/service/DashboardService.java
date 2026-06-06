package com.spaceshield.server.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;

import com.spaceshield.server.dto.AsteroidDTO;
import com.spaceshield.server.dto.DashboardDTO;
import com.spaceshield.server.dto.FireballDTO;
import com.spaceshield.server.dto.SolarFlareDTO;
import com.spaceshield.server.repository.AsteroidRepository;
import com.spaceshield.server.repository.FireballRepository;
import com.spaceshield.server.repository.SolarFlareRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AsteroidService asteroidService;
    private final FireballService fireballService;
    private final SolarService solarService;
    private final AsteroidRepository asteroidRepository;
    private final FireballRepository fireballRepository;
    private final SolarFlareRepository solarFlareRepository;

    public DashboardDTO getDashboard() {
        List<AsteroidDTO> asteroids = asteroidService.findAll();
        List<FireballDTO> fireballs = fireballService.findAll();
        List<SolarFlareDTO> solarFlares = solarService.findAll();

        // Fireballs with known coordinates (for the map)
        List<FireballDTO> mappableFireballs = fireballService.findMappable();

        // Count events by risk level
        long criticalCount = asteroids.stream()
                .filter(a -> "CRITICAL".equalsIgnoreCase(a.getRiskLevel())).count()
                + fireballs.stream()
                        .filter(f -> "CRITICAL".equalsIgnoreCase(f.getRiskLevel())).count()
                + solarFlares.stream()
                        .filter(s -> "CRITICAL".equalsIgnoreCase(s.getRiskLevel())).count();

        long watchCount = asteroids.stream()
                .filter(a -> "WATCH".equalsIgnoreCase(a.getRiskLevel())).count()
                + fireballs.stream()
                        .filter(f -> "WATCH".equalsIgnoreCase(f.getRiskLevel())).count()
                + solarFlares.stream()
                        .filter(s -> "WATCH".equalsIgnoreCase(s.getRiskLevel())).count();

        // Count significant solar flares (X and M class)
        long significantSolarFlares = solarFlares.stream()
                .filter(s -> s.getClassType() != null
                        && (s.getClassType().toUpperCase().startsWith("X")
                                || s.getClassType().toUpperCase().startsWith("M")))
                .count();

        return DashboardDTO.builder()
                .asteroids(asteroids)
                .fireballs(fireballs)
                .mappableFireballs(mappableFireballs)
                .solarFlares(solarFlares)
                .totalAsteroids(asteroidRepository.count())
                .totalFireballs(fireballRepository.count())
                .totalSolarFlares(solarFlareRepository.count())
                .criticalEvents(criticalCount)
                .watchEvents(watchCount)
                .significantSolarFlares(significantSolarFlares)
                .lastUpdated(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build();
    }
}
