package com.spaceshield.server.kafka.config;

import com.spaceshield.server.kafka.event.AsteroidEvent;
import com.spaceshield.server.kafka.event.FireballEvent;
import com.spaceshield.server.kafka.event.RiskEvent;
import com.spaceshield.server.kafka.event.SolarFlareEvent;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.kafka.autoconfigure.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.*;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    // ── Topics ───────────────────────────────────────────────────────────────

    @Bean
    public NewTopic asteroidsTopic() {
        return TopicBuilder.name(KafkaTopics.ASTEROIDS).partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic solarTopic() {
        return TopicBuilder.name(KafkaTopics.SOLAR).partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic fireballsTopic() {
        return TopicBuilder.name(KafkaTopics.FIREBALLS).partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic risksTopic() {
        return TopicBuilder.name(KafkaTopics.RISKS).partitions(1).replicas(1).build();
    }

    // ── Producer ─────────────────────────────────────────────────────────────
    // Reuses yaml config via KafkaProperties — no duplication

    @Bean
    public ProducerFactory<String, Object> producerFactory(KafkaProperties kafkaProperties) {
        return new DefaultKafkaProducerFactory<>(kafkaProperties.buildProducerProperties());
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate(ProducerFactory<String, Object> producerFactory) {
        return new KafkaTemplate<>(producerFactory);
    }

    // ── Consumer factory builder ──────────────────────────────────────────────

    private <T> ConcurrentKafkaListenerContainerFactory<String, T> factory(Class<T> type) {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "space-shield-group");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        ConsumerFactory<String, T> cf = new DefaultKafkaConsumerFactory<>(
                props,
                new ErrorHandlingDeserializer<>(new StringDeserializer()),
                new ErrorHandlingDeserializer<>(new JsonDeserializer<>(type, false)));

        ConcurrentKafkaListenerContainerFactory<String, T> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(cf);
        return factory;
    }

    // ── Per-type consumer factories ───────────────────────────────────────────

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, AsteroidEvent> asteroidFactory() {
        return factory(AsteroidEvent.class);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, SolarFlareEvent> solarFlareFactory() {
        return factory(SolarFlareEvent.class);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, FireballEvent> fireballFactory() {
        return factory(FireballEvent.class);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, RiskEvent> riskFactory() {
        return factory(RiskEvent.class);
    }
}