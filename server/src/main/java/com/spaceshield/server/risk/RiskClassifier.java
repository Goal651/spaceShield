package com.spaceshield.server.risk;

import com.spaceshield.server.kafka.event.AsteroidEvent;
import com.spaceshield.server.kafka.event.FireballEvent;
import com.spaceshield.server.kafka.event.RiskEvent;
import com.spaceshield.server.kafka.event.SolarFlareEvent;
import org.springframework.stereotype.Component;

@Component
public class RiskClassifier {

    // ── Asteroid thresholds ──────────────────────────────────────────────────
    // Miss distance: < 1,000,000 km = WATCH, < 500,000 km = CRITICAL
    // Size:          > 140m diameter (NASA PHO threshold) escalates risk
    private static final double ASTEROID_CRITICAL_DISTANCE_KM = 500_000;
    private static final double ASTEROID_WATCH_DISTANCE_KM    = 1_000_000;
    private static final double ASTEROID_LARGE_DIAMETER_KM    = 0.14;   // 140m

    public RiskEvent classifyAsteroid(AsteroidEvent event) {
        double distance = event.missDistanceKm();
        double size     = event.diameterMaxKm();

        String level;
        int    score;
        String reason;

        if (distance < ASTEROID_CRITICAL_DISTANCE_KM || (event.isPotentiallyHazardous() && size > ASTEROID_LARGE_DIAMETER_KM)) {
            level  = "CRITICAL";
            score  = 90;
            reason = "Asteroid %s is within %.0f km of Earth — classified as potentially hazardous."
                    .formatted(event.name(), distance);
        } else if (distance < ASTEROID_WATCH_DISTANCE_KM) {
            level  = "WATCH";
            score  = 55;
            reason = "Asteroid %s passing at %.0f km — within watch threshold."
                    .formatted(event.name(), distance);
        } else {
            level  = "SAFE";
            score  = 10;
            reason = "Asteroid %s is passing at a safe distance of %.0f km from Earth."
                    .formatted(event.name(), distance);
        }

        return new RiskEvent(event.id(), "ASTEROID", level, score, reason);
    }

    // ── Solar flare thresholds ───────────────────────────────────────────────
    // X class = CRITICAL, M class = WATCH, anything below = SAFE
    public RiskEvent classifySolarFlare(SolarFlareEvent event) {
        String classType = event.classType() != null ? event.classType().toUpperCase() : "";
        char   flareClass = classType.isEmpty() ? 'A' : classType.charAt(0);

        String level;
        int    score;
        String reason;

        switch (flareClass) {
            case 'X' -> {
                level  = "CRITICAL";
                score  = 95;
                reason = "X-class solar flare (%s) detected — may cause global radio blackouts and geomagnetic storms."
                        .formatted(event.classType());
            }
            case 'M' -> {
                level  = "WATCH";
                score  = 60;
                reason = "M-class solar flare (%s) detected — minor radio blackouts possible on the sunlit side of Earth."
                        .formatted(event.classType());
            }
            default -> {
                level  = "SAFE";
                score  = 15;
                reason = "%s-class solar flare detected — no significant impact expected."
                        .formatted(event.classType());
            }
        }

        return new RiskEvent(event.flrId(), "SOLAR_FLARE", level, score, reason);
    }

    // ── Fireball thresholds ──────────────────────────────────────────────────
    // Impact energy: > 1 kt = WATCH, > 10 kt = CRITICAL (Tunguska ~10–15 Mt for reference)
    private static final double FIREBALL_CRITICAL_KT = 10.0;
    private static final double FIREBALL_WATCH_KT    = 1.0;

    public RiskEvent classifyFireball(FireballEvent event) {
        double kt = event.impactEnergyKt();

        String level;
        int    score;
        String reason;

        if (kt >= FIREBALL_CRITICAL_KT) {
            level  = "CRITICAL";
            score  = 85;
            reason = "Large fireball impact detected — %.2f kilotons released. Significant atmospheric event."
                    .formatted(kt);
        } else if (kt >= FIREBALL_WATCH_KT) {
            level  = "WATCH";
            score  = 50;
            reason = "Moderate fireball detected — %.2f kilotons. Localised impact area."
                    .formatted(kt);
        } else {
            level  = "SAFE";
            score  = 10;
            reason = "Small fireball event — %.4f kilotons. No ground impact risk."
                    .formatted(kt);
        }

        return new RiskEvent(event.date(), "FIREBALL", level, score, reason);
    }
}