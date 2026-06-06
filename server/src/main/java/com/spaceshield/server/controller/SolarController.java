package com.spaceshield.server.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spaceshield.server.dto.SolarFlareDTO;
import com.spaceshield.server.service.SolarService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/solar")
@RequiredArgsConstructor
public class SolarController {
    private final SolarService solarService;

    @GetMapping
    public List<SolarFlareDTO> getAllSolarFlares() {
        return solarService.findAll();
    }

    @GetMapping("/{id}")
    public SolarFlareDTO getSolarFlareById(@PathVariable String id) {
        return solarService.findById(id);
    }
    
}
