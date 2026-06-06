package com.spaceshield.server.client.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record EstimatedDiameterDto(

        @JsonProperty("kilometers")
        DiameterRangeDto kilometers,

        @JsonProperty("meters")
        DiameterRangeDto meters,

        @JsonProperty("miles")
        DiameterRangeDto miles,

        @JsonProperty("feet")
        DiameterRangeDto feet
) {}
