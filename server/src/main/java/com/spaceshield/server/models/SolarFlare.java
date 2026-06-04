package com.spaceshield.server.models;

import java.time.LocalDateTime;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Data
public class SolarFlare {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String flareId;

    private String classType;

    private LocalDateTime beginTime;

    private LocalDateTime peakTime;

    private LocalDateTime endTime;

    private String sourceLocation;

}
