package com.spaceshield.server.models;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class Alert {
    
    private String alertId;

    private String title;

    private String message;

    private String severity;

    private LocalDateTime createdAt;
}
