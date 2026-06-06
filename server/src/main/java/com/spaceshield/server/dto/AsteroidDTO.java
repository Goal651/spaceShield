package com.spaceshield.server.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AsteroidDTO {
    private String nasaId;
    private String name;
    private Double diameterMinKm;
    private Double diameterMaxKm;
    private Double velocityKmPerSec;
    private Double missDistanceKm;
    private String closeApproachDate;
    private boolean isPotentiallyHazardous;
    private String riskLevel;           // SAFE | WATCH | CRITICAL
    private Integer riskScore;
    private String riskReason;
    private LocalDateTime ingestedAt;
}
