package com.spaceshield.server.dtos.solar;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolarFlareDto {

    private String flareId;

    private String classType;

    private LocalDateTime beginTime;

    private LocalDateTime peakTime;

    private LocalDateTime endTime;

    private String sourceLocation;

}
