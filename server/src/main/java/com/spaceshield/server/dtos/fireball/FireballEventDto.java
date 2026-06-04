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
public class FireballEventDto {

    private String eventId;

    private Double energyKt;

    private Double latitude;

    private Double longitude;

    private LocalDateTime timestamp;

}