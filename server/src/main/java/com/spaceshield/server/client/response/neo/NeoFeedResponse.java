package com.spaceshield.server.client.response.neo;

import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class NeoFeedResponse {

    private Integer element_count;

    private Map<String, List<NeoObjectResponse>>
            near_earth_objects;

}
