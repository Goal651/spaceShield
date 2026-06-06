package com.spaceshield.server.kafka.consumer;

import com.spaceshield.server.kafka.config.KafkaTopics;
import com.spaceshield.server.kafka.event.FireballEvent;
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
public class FireballConsumer {

    private final RiskClassifier riskClassifier;
    private final SpaceEventProducer producer;

    @KafkaListener(topics = KafkaTopics.FIREBALLS, groupId = "spaceshield-group", containerFactory = "kafkaListenerContainerFactory")
    public void consume(
            @Payload FireballEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        log.info("Received fireball event date={} energy={}kt partition={} offset={}",
                event.date(), event.impactEnergyKt(), partition, offset);

        RiskEvent risk = riskClassifier.classifyFireball(event);
        log.info("Fireball {} classified as {} (score={})", event.date(), risk.riskLevel(), risk.score());

        producer.publishRisk(risk);

        // fireballRepository.save(FireballDocument.from(event, risk));
    }
}