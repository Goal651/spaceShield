package com.spaceshield.server.client.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SentNotificationDto(

                @JsonProperty("messageID") String messageId,

                @JsonProperty("messageIssueTime") String messageIssueTime,

                @JsonProperty("messageURL") String messageUrl) {
}
