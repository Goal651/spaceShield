package com.spaceshield.server.repository;

import com.spaceshield.server.entity.SolarFlare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SolarFlareRepository extends JpaRepository<SolarFlare, String> {

    Optional<SolarFlare> findByFlrId(String flrId);

    boolean existsByFlrId(String flrId);

    List<SolarFlare> findByClassTypeOrderByBeginTimeDesc(String classType);

    List<SolarFlare> findByRiskLevelOrderByIngestedAtDesc(String riskLevel);

    // X and M class flares only — the ones that matter
    @Query("SELECT s FROM SolarFlare s WHERE s.classType LIKE 'X%' OR s.classType LIKE 'M%' ORDER BY s.ingestedAt DESC LIMIT 20")
    List<SolarFlare> findSignificantFlares();
}