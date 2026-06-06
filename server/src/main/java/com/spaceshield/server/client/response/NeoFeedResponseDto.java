package com.spaceshield.server.client.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

public record NeoFeedResponseDto(

        @JsonProperty("element_count") int elementCount,

        @JsonProperty("near_earth_objects") Map<String, List<NearEarthObjectDto>> nearEarthObjects) {
}
