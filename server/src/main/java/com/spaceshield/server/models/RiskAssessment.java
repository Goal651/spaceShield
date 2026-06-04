package com.spaceshield.server.models;

import lombok.Data;

@Data
public class RiskAssessment {
    private String eventId;

    private String eventType;

    private Integer riskScore;

    private String riskLevel;

    private String reason;

}
