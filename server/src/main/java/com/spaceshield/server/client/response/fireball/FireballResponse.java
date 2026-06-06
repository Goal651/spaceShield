package com.spaceshield.server.client.response.fireball;

import java.util.List;

import lombok.Data;

@Data
public class FireballResponse {

    private List<String> fields;

    private List<List<String>> data;

}