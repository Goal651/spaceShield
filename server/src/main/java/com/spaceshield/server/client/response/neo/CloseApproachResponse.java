package com.spaceshield.server.client.response.neo;

import lombok.Data;

@Data
public class CloseApproachResponse {

    private String close_approach_date_full;

    private RelativeVelocityResponse relative_velocity;

    private MissDistanceResponse miss_distance;

}