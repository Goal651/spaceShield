package com.spaceshield.server.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "fireballs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fireball {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // NASA fireballs have no stable ID — use date as natural unique key
    @Column(name = "event_date", nullable = false, unique = true)
    private String eventDate;           // "YYYY-MM-DD hh:mm:ss"

    @Column(name = "lat")
    private Double lat;                 // nullable

    @Column(name = "lat_dir", length = 2)
    private String latDir;              // "N" | "S" | null

    @Column(name = "lon")
    private Double lon;                 // nullable

    @Column(name = "lon_dir", length = 2)
    private String lonDir;              // "E" | "W" | null

    @Column(name = "altitude_km")
    private Double altitudeKm;          // nullable

    @Column(name = "energy_joules", nullable = false)
    private Double energyJoules;        // ×10¹⁰ J — always present

    @Column(name = "impact_energy_kt", nullable = false)
    private Double impactEnergyKt;      // kilotons — always present

    @Column(name = "risk_level", length = 20)
    private String riskLevel;

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