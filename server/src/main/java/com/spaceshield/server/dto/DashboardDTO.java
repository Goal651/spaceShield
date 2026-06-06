package com.spaceshield.server.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardDTO {

    private List<AsteroidDTO> asteroids;
    private List<FireballDTO> fireballs;
    private List<FireballDTO> mappableFireballs; // Fireballs with known coordinates for the map
    private List<SolarFlareDTO> solarFlares;

    private long totalAsteroids;
    private long totalFireballs;
    private long totalSolarFlares;

    private long criticalEvents;
    private long watchEvents;

    private long significantSolarFlares; // X and M class

    private String lastUpdated;
}
