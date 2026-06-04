package com.spaceshield.server.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.spaceshield.server.entity.SolarFlare;

public interface SolarFlareRepository extends JpaRepository<SolarFlare, UUID> {

}
