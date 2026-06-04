package com.spaceshield.server.dtos.asteroid;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AsteroidDto {

    private String id;

    private String name;

    private Double diameterMinMeters;

    private Double diameterMaxMeters;

    private Double speedKmPerHour;

    private Double missDistanceKm;

    private Boolean potentiallyHazardous;

    private LocalDateTime closeApproachDate;

}