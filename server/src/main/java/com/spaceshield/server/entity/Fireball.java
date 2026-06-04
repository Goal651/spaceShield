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
@Table(name = "fireballs")
@Data
public class Fireball {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private Double latitude;

    private Double longitude;

    private Double velocityKmPerSecond;

    private Double energyKt;

    private LocalDateTime eventTime;
}