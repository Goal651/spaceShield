package com.spaceshield.server.repository;

import com.spaceshield.server.entity.RiskAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskAssessmentRepository extends JpaRepository<RiskAssessment, Long> {

    List<RiskAssessment> findBySourceEventId(String sourceEventId);

    List<RiskAssessment> findByRiskLevelOrderByAssessedAtDesc(String riskLevel);

    List<RiskAssessment> findByEventTypeOrderByAssessedAtDesc(String eventType);

    // Dashboard: all CRITICAL events across all types, most recent first
    @Query("SELECT r FROM RiskAssessment r WHERE r.riskLevel = 'CRITICAL' ORDER BY r.assessedAt DESC LIMIT 10")
    List<RiskAssessment> findRecentCritical();

    // Count by risk level — used for dashboard summary cards
    long countByRiskLevel(String riskLevel);

    long countByEventType(String eventType);
}