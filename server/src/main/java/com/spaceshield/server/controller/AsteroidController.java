package com.spaceshield.server.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spaceshield.server.dto.AsteroidDTO;
import com.spaceshield.server.service.AsteroidService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/asteroid")
@RequiredArgsConstructor
public class AsteroidController {
    private final AsteroidService asteroidService;


    @GetMapping
    public List<AsteroidDTO> getAllAsteroids() {
        return asteroidService.findAll();
    }

    @GetMapping("/{id}")
    public AsteroidDTO getAsteroidById(@PathVariable String id) {
        return asteroidService.findById(id);
    }

    @GetMapping("/nasaId/{nasaId}")
    public AsteroidDTO getAsteroidByNasaId(@PathVariable String nasaId) {
        return asteroidService.findByNasaId(nasaId);
    }
    
}
