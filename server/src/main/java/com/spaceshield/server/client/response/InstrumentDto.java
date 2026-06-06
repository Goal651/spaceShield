package com.spaceshield.server.client.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record InstrumentDto(

                @JsonProperty("displayName") String displayName) {
}
