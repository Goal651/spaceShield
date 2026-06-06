package com.spaceshield.server.kafka.producer;

import com.spaceshield.server.kafka.config.KafkaTopics;
import com.spaceshield.server.kafka.event.AsteroidEvent;
import com.spaceshield.server.kafka.event.FireballEvent;
import com.spaceshield.server.kafka.event.RiskEvent;
import com.spaceshield.server.kafka.event.SolarFlareEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SpaceEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishAsteroid(AsteroidEvent event) {
        kafkaTemplate.send(KafkaTopics.ASTEROIDS, event.id(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish asteroid event id={}: {}", event.id(), ex.getMessage());
                    } else {
                        log.debug("Published asteroid event id={} offset={}",
                                event.id(), result.getRecordMetadata().offset());
                    }
                });
    }

    public void publishSolarFlare(SolarFlareEvent event) {
        kafkaTemplate.send(KafkaTopics.SOLAR, event.flrId(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish solar flare id={}: {}", event.flrId(), ex.getMessage());
                    } else {
                        log.debug("Published solar flare id={} offset={}",
                                event.flrId(), result.getRecordMetadata().offset());
                    }
                });
    }

    public void publishFireball(FireballEvent event) {
        // Fireballs have no ID from NASA — use date as key for deduplication
        kafkaTemplate.send(KafkaTopics.FIREBALLS, event.date(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish fireball date={}: {}", event.date(), ex.getMessage());
                    } else {
                        log.debug("Published fireball date={} offset={}",
                                event.date(), result.getRecordMetadata().offset());
                    }
                });
    }

    public void publishRisk(RiskEvent event) {
        kafkaTemplate.send(KafkaTopics.RISKS, event.sourceEventId(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish risk event id={}: {}", event.sourceEventId(), ex.getMessage());
                    } else {
                        log.debug("Published risk event id={} level={} offset={}",
                                event.sourceEventId(), event.riskLevel(), result.getRecordMetadata().offset());
                    }
                });
    }
}