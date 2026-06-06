package com.spaceshield.server.client.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CloseApproachDto(

        @JsonProperty("close_approach_date")
        String closeApproachDate,

        @JsonProperty("close_approach_date_full")
        String closeApproachDateFull,

        @JsonProperty("epoch_date_close_approach")
        Long epochDateCloseApproach,

        @JsonProperty("relative_velocity")
        RelativeVelocityDto relativeVelocity,

        @JsonProperty("miss_distance")
        MissDistanceDto missDistance,

        @JsonProperty("orbiting_body")
        String orbitingBody
) {}
