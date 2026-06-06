package com.spaceshield.server.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.spaceshield.server.dto.SolarFlareDTO;
import com.spaceshield.server.entity.SolarFlare;
import com.spaceshield.server.mapper.SolarFlareMapper;
import com.spaceshield.server.repository.SolarFlareRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SolarService {
    private final SolarFlareRepository solarFlareRepository;
    private final SolarFlareMapper solarFlareMapper;

    public SolarFlareDTO save(SolarFlare data) {
        SolarFlare solarFlare = solarFlareRepository.save(data);
        return solarFlareMapper.toDto(solarFlare);
    }

    public List<SolarFlareDTO> findAll() {
        return solarFlareRepository.findAll()
                .stream()
                .map(solarFlareMapper::toDto)
                .collect(Collectors.toList());
    }

    public SolarFlareDTO findById(String id) {
        return solarFlareRepository.findById(id).map(solarFlareMapper::toDto).orElse(null);
    }

}
