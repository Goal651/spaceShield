package com.spaceshield.server.dtos.risk;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAssessmentDto {

    private String eventId;

    private String eventType;

    private Integer riskScore;

    private String riskLevel;

    private String reason;

}
