package com.spaceshield.server.client.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SignatureDto(

                @JsonProperty("version") String version,

                @JsonProperty("source") String source) {
}
