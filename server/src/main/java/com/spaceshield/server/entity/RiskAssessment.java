package com.spaceshield.server.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "risk_assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The ID of the source event (nasaId for asteroid, flrId for flare, eventDate for fireball)
    @Column(name = "source_event_id", nullable = false)
    private String sourceEventId;

    @Column(name = "event_type", nullable = false, length = 20)
    private String eventType;           // ASTEROID | SOLAR_FLARE | FIREBALL

    @Column(name = "risk_level", nullable = false, length = 20)
    private String riskLevel;           // SAFE | WATCH | CRITICAL

    @Column(name = "risk_score", nullable = false)
    private Integer riskScore;          // 0–100

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "assessed_at", nullable = false)
    private LocalDateTime assessedAt;

    @PrePersist
    public void prePersist() {
        if (assessedAt == null) assessedAt = LocalDateTime.now();
    }
}