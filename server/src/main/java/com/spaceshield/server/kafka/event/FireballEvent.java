package com.spaceshield.server.kafka.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record FireballEvent(

        String date,
        Double lat,            // nullable
        String latDir,         // "N" or "S", nullable
        Double lon,            // nullable
        String lonDir,         // "E" or "W", nullable
        Double altKm,          // nullable
        double energyJoules,   // ×10¹⁰ J — always present
        double impactEnergyKt  // kilotons — always present
) {}