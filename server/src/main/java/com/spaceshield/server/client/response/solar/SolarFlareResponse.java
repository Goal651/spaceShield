package com.spaceshield.server.client.response.solar;

import lombok.Data;

@Data
public class SolarFlareResponse {

    private String flrID;

    private String classType;

    private String sourceLocation;

    private String beginTime;

    private String peakTime;

    private String endTime;

}