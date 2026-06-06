package com.spaceshield.server.client.response.neo;

import lombok.Data;

@Data
public class NeoObjectResponse {

    private String id;

    private String name;

    private Boolean is_potentially_hazardous_asteroid;

}