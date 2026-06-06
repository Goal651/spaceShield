package com.spaceshield.server.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class FireballDTO {
    private Long id;
    private String eventDate;           // "YYYY-MM-DD hh:mm:ss"
    private String latDir;              // "N" | "S" | null
    private Double lon;                 // nullable
    private String lonDir;              // "E" | "W" | null
    private Double altitudeKm;          // nullable
    private Double energyJoules;        // ×10¹⁰ J — always present
    private Double impactEnergyKt;      // kilotons — always present
    private String riskLevel;
    private Integer riskScore;
    private String riskReason;
    private LocalDateTime ingestedAt;
}
