package com.spaceshield.server.client.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record NearEarthObjectDto(

                @JsonProperty("id") String id,

                @JsonProperty("neo_reference_id") String neoReferenceId,

                @JsonProperty("name") String name,

                @JsonProperty("nasa_jpl_url") String nasaJplUrl,

                @JsonProperty("absolute_magnitude_h") Double absoluteMagnitudeH,

                @JsonProperty("estimated_diameter") EstimatedDiameterDto estimatedDiameter,

                @JsonProperty("is_potentially_hazardous_asteroid") boolean isPotentiallyHazardous,

                @JsonProperty("is_sentry_object") boolean isSentryObject,

                @JsonProperty("close_approach_data") List<CloseApproachDto> closeApproachData) {
}
