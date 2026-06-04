package com.spaceshield.server.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.spaceshield.server.entity.Asteroid;

public interface AsteroidRepository extends JpaRepository<Asteroid, UUID> {
    
}
