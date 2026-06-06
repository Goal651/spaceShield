package com.spaceshield.server.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.spaceshield.server.dto.FireballDTO;
import com.spaceshield.server.entity.Fireball;
import com.spaceshield.server.mapper.FireballMapper;
import com.spaceshield.server.repository.FireballRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FireballService {

    private final FireballRepository fireballRepository;
    private final FireballMapper fireballMapper;

    public FireballDTO save(Fireball data) {
        Fireball fireball = fireballRepository.save(data);
        return fireballMapper.toDto(fireball);
    }

    public List<FireballDTO> findAll() {
        return fireballRepository.findAll()
                .stream()
                .map(fireballMapper::toDto)
                .collect(Collectors.toList());
    }

    public FireballDTO findById(Long id) {
        return fireballRepository.findById(id).map(fireballMapper::toDto).orElse(null);
    }

}
