package com.spaceshield.server.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "asteroids")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asteroid {

    @Id
    @Column(name = "nasa_id", nullable = false, unique = true)
    private String nasaId;

    @Column(nullable = false)
    private String name;

    @Column(name = "diameter_min_km")
    private Double diameterMinKm;

    @Column(name = "diameter_max_km")
    private Double diameterMaxKm;

    @Column(name = "velocity_km_per_sec")
    private Double velocityKmPerSec;

    @Column(name = "miss_distance_km")
    private Double missDistanceKm;

    @Column(name = "close_approach_date")
    private String closeApproachDate;

    @Column(name = "is_potentially_hazardous")
    private boolean isPotentiallyHazardous;

    @Column(name = "risk_level", length = 20)
    private String riskLevel;           // SAFE | WATCH | CRITICAL

    @Column(name = "risk_score")
    private Integer riskScore;

    @Column(name = "risk_reason", columnDefinition = "TEXT")
    private String riskReason;

    @Column(name = "ingested_at", nullable = false)
    private LocalDateTime ingestedAt;

    @PrePersist
    public void prePersist() {
        if (ingestedAt == null) ingestedAt = LocalDateTime.now();
    }
}