package com.spaceshield.server.models;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Asteroid {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String name;
    private Double diameterMinMeters;
    private Double diameterMaxMeters;
    private Double speedKmPerHour;
    private Double missDistanceKm;
    private Boolean potentiallyHazardous;
    private LocalDateTime closeApproachDate;

}
