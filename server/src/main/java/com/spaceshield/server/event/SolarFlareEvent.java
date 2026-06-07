package com.spaceshield.server.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SolarFlareEvent(

        String flrId,
        String classType,      // A, B, C, M, X
        String beginTime,
        String peakTime,
        String endTime,        // nullable
        String sourceLocation  // e.g. "N25W45"
) {}