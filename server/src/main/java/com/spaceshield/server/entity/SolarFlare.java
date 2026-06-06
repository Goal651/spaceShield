package com.spaceshield.server.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "solar_flares")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolarFlare {

    @Id
    @Column(name = "flr_id", nullable = false, unique = true)
    private String flrId;

    @Column(name = "class_type", length = 10)
    private String classType;           // A, B, C, M, X

    @Column(name = "begin_time")
    private String beginTime;

    @Column(name = "peak_time")
    private String peakTime;

    @Column(name = "end_time")
    private String endTime;             // nullable — may still be ongoing

    @Column(name = "source_location", length = 20)
    private String sourceLocation;      // e.g. "N25W45"

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