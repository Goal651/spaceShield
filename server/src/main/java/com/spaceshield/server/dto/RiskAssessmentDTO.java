package com.spaceshield.server.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class RiskAssessmentDTO {
    private Long id;
    private String sourceEventId;
    private String eventType;           
    private String riskLevel; 
    private Integer riskScore; 
    private String reason;  
    private LocalDateTime assessedAt;
}
