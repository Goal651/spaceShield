package com.spaceshield.server.kafka.consumer;

import com.spaceshield.server.entity.RiskAssessment;
import com.spaceshield.server.entity.SolarFlare;
import com.spaceshield.server.kafka.config.KafkaTopics;
import com.spaceshield.server.kafka.event.RiskEvent;
import com.spaceshield.server.kafka.event.SolarFlareEvent;
import com.spaceshield.server.kafka.producer.SpaceEventProducer;
import com.spaceshield.server.risk.RiskClassifier;
import com.spaceshield.server.service.SolarService;
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
public class SolarConsumer {

        private final RiskClassifier riskClassifier;
        private final SpaceEventProducer producer;
        private final SolarService solarService;
        private final RiskAssessmentService riskAssessmentService;

        @KafkaListener(topics = KafkaTopics.SOLAR, groupId = "space-shield-group", containerFactory = "solarFlareFactory")
        public void consume(
                        @Payload SolarFlareEvent event,
                        @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
                        @Header(KafkaHeaders.OFFSET) long offset) {
                log.info("Received solar flare id={} class={} partition={} offset={}",
                                event.flrId(), event.classType(), partition, offset);

                if (solarService.existsByFlrId(event.flrId())) {
                        log.debug("Solar flare id={} already exists, skipping", event.flrId());
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

                producer.publishRisk(risk);

                log.info("Saved solar flare id={} riskLevel={}", event.flrId(), risk.riskLevel());
        }
}