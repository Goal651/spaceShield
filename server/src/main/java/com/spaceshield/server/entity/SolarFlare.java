package com.spaceshield.server.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "solar_flares")
@Data
public class SolarFlare {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID flareId;

    private String classType;

    private LocalDateTime beginTime;

    private LocalDateTime peakTime;

    private LocalDateTime endTime;

    private String sourceLocation;
}