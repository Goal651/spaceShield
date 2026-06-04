package com.spaceshield.server.scheduler;

import org.springframework.scheduling.annotation.Scheduled;

public class SolarScheduler {
    @Scheduled(fixedRate = 300000)
    public void fetchSolarEvents() {
    }
}
