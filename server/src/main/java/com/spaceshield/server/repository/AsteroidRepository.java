package com.spaceshield.server.repository;

import com.spaceshield.server.entity.Asteroid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AsteroidRepository extends JpaRepository<Asteroid, String> {

    Optional<Asteroid> findByNasaId(String nasaId);

    boolean existsByNasaId(String nasaId);

    List<Asteroid> findByRiskLevelOrderByIngestedAtDesc(String riskLevel);

    List<Asteroid> findByIsPotentiallyHazardousTrueOrderByMissDistanceKmAsc();

    // Latest N asteroids for the dashboard
    @Query("SELECT a FROM Asteroid a ORDER BY a.ingestedAt DESC LIMIT 20")
    List<Asteroid> findLatest();
}