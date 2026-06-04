package com.spaceshield.server.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.spaceshield.server.entity.Fireball;

public interface FireballRepository extends JpaRepository<Fireball, UUID> {

}
