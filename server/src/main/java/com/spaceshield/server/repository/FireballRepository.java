package com.spaceshield.server.repository;

import com.spaceshield.server.entity.Fireball;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FireballRepository extends JpaRepository<Fireball, Long> {

    Optional<Fireball> findByEventDate(String eventDate);

    boolean existsByEventDate(String eventDate);

    List<Fireball> findByRiskLevelOrderByImpactEnergyKtDesc(String riskLevel);

    // Fireballs with known location only (for map display)
    @Query("SELECT f FROM Fireball f WHERE f.lat IS NOT NULL AND f.lon IS NOT NULL ORDER BY f.ingestedAt DESC LIMIT 50")
    List<Fireball> findMappable();

    @Query("SELECT f FROM Fireball f ORDER BY f.ingestedAt DESC LIMIT 20")
    List<Fireball> findLatest();
}