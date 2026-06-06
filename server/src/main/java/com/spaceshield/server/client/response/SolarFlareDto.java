package com.spaceshield.server.client.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record SolarFlareDto(

                @JsonProperty("flrID") String flrId,

                @JsonProperty("catalog") String catalog,

                @JsonProperty("instruments") List<InstrumentDto> instruments,

                // Note: NASA typo in the API — field is literally "beginTime" but docs say
                // "begineTime"
                @JsonProperty("beginTime") String beginTime,

                @JsonProperty("peakTime") String peakTime,

                @JsonProperty("endTime") String endTime, // nullable — flare may still be ongoing

                @JsonProperty("classType") String classType, // A, B, C, M, X

                @JsonProperty("sourceLocation") String sourceLocation, // e.g. "N25W45"

                @JsonProperty("activeRegionNum") Integer activeRegionNum, // nullable

                @JsonProperty("note") String note,

                @JsonProperty("submissionTime") String submissionTime,

                @JsonProperty("versionId") Integer versionId,

                @JsonProperty("link") String link,

                @JsonProperty("linkedEvents") List<LinkedEventDto> linkedEvents,

                @JsonProperty("sentNotifications") List<SentNotificationDto> sentNotifications) {
}
