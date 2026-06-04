package com.spaceshield.server.models;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class Fireball {
   private LocalDateTime eventTime;

    private Double latitude;

    private Double longitude;

    private Double altitudeKm;

    private Double velocityKmPerSecond;

    private Double energyKt; 
}
