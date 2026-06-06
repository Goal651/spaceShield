package com.spaceshield.server.kafka.consumer;

import com.spaceshield.server.entity.Asteroid;
import com.spaceshield.server.entity.RiskAssessment;
import com.spaceshield.server.kafka.config.KafkaTopics;
import com.spaceshield.server.kafka.event.AsteroidEvent;
import com.spaceshield.server.kafka.event.RiskEvent;
import com.spaceshield.server.kafka.producer.SpaceEventProducer;
import com.spaceshield.server.risk.RiskClassifier;
import com.spaceshield.server.service.AsteroidService;
import com.spaceshield.server.service.RiskAssessmentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AsteroidConsumer {

        private final RiskClassifier riskClassifier;
        private final SpaceEventProducer producer;
        private final AsteroidService asteroidService;
        private final RiskAssessmentService riskAssessmentService;

        @KafkaListener(topics = KafkaTopics.ASTEROIDS, groupId = "space-shield-group", containerFactory = "asteroidFactory")
        public void consume(
                        @Payload AsteroidEvent event,
                        @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
                        @Header(KafkaHeaders.OFFSET) long offset) {
                log.info("Received asteroid id={} name={} partition={} offset={}",
                                event.id(), event.name(), partition, offset);

                // Skip duplicates — NASA re-sends the same asteroid across overlapping date
                // windows
                if (asteroidService.existsByNasaId(event.id())) {
                        log.debug("Asteroid id={} already exists, skipping", event.id());
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

                // 4. Publish risk event downstream (dashboard / alerts)
                producer.publishRisk(risk);

                log.info("Saved asteroid id={} riskLevel={}", event.id(), risk.riskLevel());
        }
}