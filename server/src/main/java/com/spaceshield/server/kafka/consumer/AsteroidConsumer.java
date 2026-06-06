package com.spaceshield.server.kafka.consumer;

import com.spaceshield.server.kafka.config.KafkaTopics;
import com.spaceshield.server.kafka.event.AsteroidEvent;
import com.spaceshield.server.kafka.event.RiskEvent;
import com.spaceshield.server.kafka.producer.SpaceEventProducer;
import com.spaceshield.server.risk.RiskClassifier;
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

    @KafkaListener(topics = KafkaTopics.ASTEROIDS, groupId = "spaceshield-group", containerFactory = "kafkaListenerContainerFactory")
    public void consume(
            @Payload AsteroidEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        log.info("Received asteroid event id={} name={} partition={} offset={}",
                event.id(), event.name(), partition, offset);

        // 1. Classify risk
        RiskEvent risk = riskClassifier.classifyAsteroid(event);
        log.info("Asteroid {} classified as {} (score={})", event.id(), risk.riskLevel(), risk.score());

        // 2. Publish risk event — RiskConsumer / dashboard picks this up
        producer.publishRisk(risk);

        // 3. Persist to MongoDB goes here (inject your repository and save)
        // asteroidRepository.save(AsteroidDocument.from(event, risk));
    }
}