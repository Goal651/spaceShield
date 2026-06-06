package com.spaceshield.server.client.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record FireballResponseDto(

                @JsonProperty("signature") SignatureDto signature,

                @JsonProperty("count") int count,

                @JsonProperty("fields") List<String> fields,

                // Each inner list is a row — values align positionally with fields[]
                @JsonProperty("data") List<List<String>> data) {
}
