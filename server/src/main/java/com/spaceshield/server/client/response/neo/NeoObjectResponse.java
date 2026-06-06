package com.spaceshield.server.client.response.neo;

import java.util.List;

import lombok.Data;

@Data
public class NeoObjectResponse {

    private String id;

    private String name;

    private Boolean is_potentially_hazardous_asteroid;

    private DiameterResponse estimated_diameter;

    private List<CloseApproachResponse> close_approach_data;

}