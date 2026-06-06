package com.spaceshield.server.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class SolarFlareDTO {
    private String flrId;
    private String classType;
    private String beginTime;
    private String peakTime;
    private String endTime;
    private String sourceLocation;
    private String riskLevel;
    private Integer riskScore;
    private String riskReason;
    private LocalDateTime ingestedAt;

}
