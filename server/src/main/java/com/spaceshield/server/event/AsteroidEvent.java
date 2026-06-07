package com.spaceshield.server.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AsteroidEvent(

        String id,
        String name,
        double diameterMinKm,
        double diameterMaxKm,
        double velocityKmPerSec,
        double missDistanceKm,
        String closeApproachDate,
        boolean isPotentiallyHazardous
) {}