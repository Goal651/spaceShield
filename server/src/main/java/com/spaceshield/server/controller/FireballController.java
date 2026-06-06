package com.spaceshield.server.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spaceshield.server.dto.FireballDTO;
import com.spaceshield.server.service.FireballService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/fireball")
@RequiredArgsConstructor
public class FireballController {
    private final FireballService fireballService;

    @GetMapping
    public List<FireballDTO> getAllFireballs() {
        return fireballService.findAll();
    }

    @GetMapping("/{id}")
    public FireballDTO getFireballById(@PathVariable Long id) {
        return fireballService.findById(id);
    }
    
}
