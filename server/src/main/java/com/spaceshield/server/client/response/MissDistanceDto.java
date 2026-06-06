package com.spaceshield.server.client.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MissDistanceDto(

                @JsonProperty("astronomical") String astronomical,

                @JsonProperty("lunar") String lunar,

                @JsonProperty("kilometers") String kilometers,

                @JsonProperty("miles") String miles) {
}
