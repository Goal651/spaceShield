package com.spaceshield.server.dtos.dashboard;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {

    private Long asteroidCount;

    private Long solarEventCount;

    private Long fireballCount;

    private Long activeAlerts;

}