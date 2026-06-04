package com.spaceshield.server.dtos.alert;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertDto {

    private String alertId;

    private String title;

    private String message;

    private String severity;

    private LocalDateTime createdAt;

}