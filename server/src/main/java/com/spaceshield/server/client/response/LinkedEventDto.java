package com.spaceshield.server.client.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record LinkedEventDto(

        @JsonProperty("activityID") String activityId // e.g. "2024-01-01T12:00:00-CME-001"
) {
}
