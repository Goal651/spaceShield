package com.spaceshield.server.scheduler;

import org.springframework.scheduling.annotation.Scheduled;

public class FireballScheduler {
    @Scheduled(fixedRate = 300000)
    public void fetchFireballs() {
    }
}
