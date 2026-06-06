package com.spaceshield.server.kafka.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic asteroidsTopic() {
        return TopicBuilder.name(KafkaTopics.ASTEROIDS)
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic solarTopic() {
        return TopicBuilder.name(KafkaTopics.SOLAR)
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic fireballsTopic() {
        return TopicBuilder.name(KafkaTopics.FIREBALLS)
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic risksTopic() {
        return TopicBuilder.name(KafkaTopics.RISKS)
                .partitions(1)
                .replicas(1)
                .build();
    }
}