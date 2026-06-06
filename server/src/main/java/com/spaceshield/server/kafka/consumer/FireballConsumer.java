package com.spaceshield.server.kafka.consumer;

import com.spaceshield.server.entity.Fireball;
import com.spaceshield.server.entity.RiskAssessment;
import com.spaceshield.server.kafka.config.KafkaTopics;
import com.spaceshield.server.kafka.event.FireballEvent;
import com.spaceshield.server.kafka.event.RiskEvent;
import com.spaceshield.server.kafka.producer.SpaceEventProducer;
import com.spaceshield.server.risk.RiskClassifier;
import com.spaceshield.server.service.FireballService;
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
public class FireballConsumer {

        private final RiskClassifier riskClassifier;
        private final SpaceEventProducer producer;
        private final FireballService fireballService;
        private final RiskAssessmentService riskAssessmentService;

        @KafkaListener(topics = KafkaTopics.FIREBALLS, groupId = "space-shield-group", containerFactory = "fireballFactory")
        public void consume(
                        @Payload FireballEvent event,
                        @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
                        @Header(KafkaHeaders.OFFSET) long offset) {
                log.info("Received fireball date={} energy={}kt partition={} offset={}",
                                event.date(), event.impactEnergyKt(), partition, offset);

                // eventDate is the natural unique key for fireballs
                if (fireballService.existsByEventDate(event.date())) {
                        log.debug("Fireball date={} already exists, skipping", event.date());
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

                producer.publishRisk(risk);

                log.info("Saved fireball date={} riskLevel={}", event.date(), risk.riskLevel());
        }
}