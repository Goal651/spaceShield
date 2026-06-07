package com.spaceshield.server.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RiskEvent(

        String sourceEventId,   // id from the originating event
        String eventType,       // "ASTEROID" | "SOLAR_FLARE" | "FIREBALL"
        String riskLevel,       // "SAFE" | "WATCH" | "CRITICAL"
        int    score,           // 0–100
        String reason           // human-readable explanation for the dashboard
) {}