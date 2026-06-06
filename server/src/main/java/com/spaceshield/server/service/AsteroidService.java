package com.spaceshield.server.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.spaceshield.server.dto.AsteroidDTO;
import com.spaceshield.server.entity.Asteroid;
import com.spaceshield.server.mapper.AsteroidMapper;
import com.spaceshield.server.repository.AsteroidRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AsteroidService {
    private final AsteroidRepository asteroidRepository;
    private final AsteroidMapper asteroidMapper;

    public AsteroidDTO save(Asteroid data) {
        Asteroid asteroid = asteroidRepository.save(data);
        return asteroidMapper.toDto(asteroid);
    }

    public List<AsteroidDTO> findAll() {
        return asteroidRepository.findAll()
                .stream()
                .map(asteroidMapper::toDto)
                .collect(Collectors.toList());
    }

    public AsteroidDTO findById(String id) {
        return asteroidRepository.findById(id).map(asteroidMapper::toDto).orElse(null);
    }

    public AsteroidDTO findByNasaId(String nasaId) {
        return asteroidRepository.findByNasaId(nasaId).map(asteroidMapper::toDto).orElse(null);
    }

    public boolean existsByNasaId(String nasaId) {
        return asteroidRepository.existsByNasaId(nasaId);
    }

}
