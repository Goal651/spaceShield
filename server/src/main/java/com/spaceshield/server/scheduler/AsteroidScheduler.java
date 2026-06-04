package com.spaceshield.server.scheduler;

import org.springframework.scheduling.annotation.Scheduled;

public class AsteroidScheduler {
    
    @Scheduled(fixedRate = 300000)
    public void fetchAsteroids() {
    }
}
