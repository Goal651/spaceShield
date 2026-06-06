package com.spaceshield.server.kafka.consumer;

import com.spaceshield.server.kafka.config.KafkaTopics;
import com.spaceshield.server.kafka.event.RiskEvent;
import com.spaceshield.server.kafka.event.SolarFlareEvent;
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
public class SolarConsumer {

    private final RiskClassifier riskClassifier;
    private final SpaceEventProducer producer;

    @KafkaListener(topics = KafkaTopics.SOLAR, groupId = "spaceshield-group", containerFactory = "kafkaListenerContainerFactory")
    public void consume(
            @Payload SolarFlareEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        log.info("Received solar flare id={} class={} partition={} offset={}",
                event.flrId(), event.classType(), partition, offset);

        RiskEvent risk = riskClassifier.classifySolarFlare(event);
        log.info("Solar flare {} classified as {} (score={})", event.flrId(), risk.riskLevel(), risk.score());

        producer.publishRisk(risk);

        // solarFlareRepository.save(SolarFlareDocument.from(event, risk));
    }
}