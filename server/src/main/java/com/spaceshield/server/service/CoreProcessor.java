package com.spaceshield.server.service;

import org.springframework.stereotype.Service;

import com.spaceshield.server.entity.Asteroid;
import com.spaceshield.server.entity.Fireball;
import com.spaceshield.server.entity.RiskAssessment;
import com.spaceshield.server.entity.SolarFlare;
import com.spaceshield.server.event.AsteroidEvent;
import com.spaceshield.server.event.FireballEvent;
import com.spaceshield.server.event.RiskEvent;
import com.spaceshield.server.event.SolarFlareEvent;
import com.spaceshield.server.risk.RiskClassifier;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CoreProcessor {
    private final RiskClassifier riskClassifier;
    private final AsteroidService asteroidService;
    private final RiskAssessmentService riskAssessmentService;
    private final FireballService fireballService;
    private final SolarService solarService;

    public void processAsteroidData(AsteroidEvent event) {

        // Skip duplicates — NASA re-sends the same asteroid across overlapping date
        // windows
        if (asteroidService.existsByNasaId(event.id())) {

            return;
        }

        // 1. Classify
        RiskEvent risk = riskClassifier.classifyAsteroid(event);

        // 2. Save asteroid with risk embedded
        Asteroid asteroid = Asteroid.builder()
                .nasaId(event.id())
                .name(event.name())
                .diameterMinKm(event.diameterMinKm())
                .diameterMaxKm(event.diameterMaxKm())
                .velocityKmPerSec(event.velocityKmPerSec())
                .missDistanceKm(event.missDistanceKm())
                .closeApproachDate(event.closeApproachDate())
                .isPotentiallyHazardous(event.isPotentiallyHazardous())
                .riskLevel(risk.riskLevel())
                .riskScore(risk.score())
                .riskReason(risk.reason())
                .build();

        asteroidService.save(asteroid);

        // 3. Save to risk audit table
        RiskAssessment assessment = RiskAssessment.builder()
                .sourceEventId(event.id())
                .eventType("ASTEROID")
                .riskLevel(risk.riskLevel())
                .riskScore(risk.score())
                .reason(risk.reason())
                .build();

        riskAssessmentService.save(assessment);

    }

    public void processFireballData(FireballEvent event) {
        // eventDate is the natural unique key for fireballs
        if (fireballService.existsByEventDate(event.date())) {
            return;
        }

        RiskEvent risk = riskClassifier.classifyFireball(event);

        Fireball fireball = Fireball.builder()
                .eventDate(event.date())
                .lat(event.lat())
                .latDir(event.latDir())
                .lon(event.lon())
                .lonDir(event.lonDir())
                .altitudeKm(event.altKm())
                .energyJoules(event.energyJoules())
                .impactEnergyKt(event.impactEnergyKt())
                .riskLevel(risk.riskLevel())
                .riskScore(risk.score())
                .riskReason(risk.reason())
                .build();

        fireballService.save(fireball);

        RiskAssessment assessment = RiskAssessment.builder()
                .sourceEventId(event.date())
                .eventType("FIREBALL")
                .riskLevel(risk.riskLevel())
                .riskScore(risk.score())
                .reason(risk.reason())
                .build();

        riskAssessmentService.save(assessment);

    }

    public void processSolarData(SolarFlareEvent event) {

        if (solarService.existsByFlrId(event.flrId())) {
            return;
        }

        RiskEvent risk = riskClassifier.classifySolarFlare(event);

        SolarFlare flare = SolarFlare.builder()
                .flrId(event.flrId())
                .classType(event.classType())
                .beginTime(event.beginTime())
                .peakTime(event.peakTime())
                .endTime(event.endTime())
                .sourceLocation(event.sourceLocation())
                .riskLevel(risk.riskLevel())
                .riskScore(risk.score())
                .riskReason(risk.reason())
                .build();

        solarService.save(flare);

        RiskAssessment assessment = RiskAssessment.builder()
                .sourceEventId(event.flrId())
                .eventType("SOLAR_FLARE")
                .riskLevel(risk.riskLevel())
                .riskScore(risk.score())
                .reason(risk.reason())
                .build();

        riskAssessmentService.save(assessment);

    }

}
