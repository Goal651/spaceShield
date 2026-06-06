package com.spaceshield.server.client.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RelativeVelocityDto(

                @JsonProperty("kilometers_per_second") String kilometersPerSecond,

                @JsonProperty("kilometers_per_hour") String kilometersPerHour,

                @JsonProperty("miles_per_hour") String milesPerHour) {
}
