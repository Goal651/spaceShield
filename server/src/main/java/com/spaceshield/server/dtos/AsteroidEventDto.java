package com.spaceshield.server.dtos;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AsteroidEventDto {

    private String asteroidId;

    private String asteroidName;

    private Double diameterMeters;

    private Double speedKmPerHour;

    private Double distanceKm;

    private LocalDateTime timestamp;

}