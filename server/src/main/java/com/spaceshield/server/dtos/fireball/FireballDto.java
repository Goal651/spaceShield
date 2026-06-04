package com.spaceshield.server.dtos.fireball;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FireballDto {

    private LocalDateTime eventTime;

    private Double latitude;

    private Double longitude;

    private Double altitudeKm;

    private Double velocityKmPerSecond;

    private Double energyKt;

}
