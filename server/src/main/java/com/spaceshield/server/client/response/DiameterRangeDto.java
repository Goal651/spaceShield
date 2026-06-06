package com.spaceshield.server.client.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DiameterRangeDto(

        @JsonProperty("estimated_diameter_min")
        Double min,

        @JsonProperty("estimated_diameter_max")
        Double max
) {}
