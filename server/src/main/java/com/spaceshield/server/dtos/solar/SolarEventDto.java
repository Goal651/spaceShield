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
public class SolarEventDto {

    private String eventId;

    private String classType;

    private LocalDateTime timestamp;

}