package com.spaceshield.server.risk;

import org.springframework.stereotype.Component;

import com.spaceshield.server.event.AsteroidEvent;
import com.spaceshield.server.event.FireballEvent;
import com.spaceshield.server.event.RiskEvent;
import com.spaceshield.server.event.SolarFlareEvent;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class RiskClassifier {

    // ── Asteroid thresholds ──────────────────────────────────────────────────
    // Miss distance: < 1,000,000 km = WATCH, < 500,000 km = CRITICAL
    // Size:          > 140m diameter (NASA PHO threshold) escalates risk
    private static final double ASTEROID_CRITICAL_DISTANCE_KM = 500_000;
    private static final double ASTEROID_WATCH_DISTANCE_KM    = 1_000_000;
    private static final double ASTEROID_LARGE_DIAMETER_KM    = 0.14;   // 140m

    // ── Fireball thresholds ──────────────────────────────────────────────────
    // Impact energy: > 1 kt = WATCH, > 10 kt = CRITICAL (Tunguska ~10–15 Mt for reference)
    private static final double FIREBALL_CRITICAL_KT = 10.0;
    private static final double FIREBALL_WATCH_KT    = 1.0;

    // ── Solar flare ──────────────────────────────────────────────────────────
    // Solar flares are detected AS THEY HAPPEN — there is no "watch" phase.
    // Instead we use real space weather impact scales (based on NOAA SWPC):
    //   MINOR    → A/B/C-class, or non-Earth-directed
    //   MODERATE → M1–M4.9  (R1–R2 radio blackouts)
    //   SEVERE   → M5–M9.9  (R3 radio blackouts)
    //   EXTREME  → X1–X9.9  (R4 radio blackouts)
    //   CRITICAL → X10+     (R5 radio blackouts, global disruption)
    private static final Pattern CLASS_TYPE_PATTERN = Pattern.compile("([ABCMX])(\\d+(?:\\.\\d+)?)?", Pattern.CASE_INSENSITIVE);
    private static final Pattern SOURCE_LOC_PATTERN = Pattern.compile("([NSEW])(\\d+)([NSEW])(\\d+)", Pattern.CASE_INSENSITIVE);

    // Maximum degrees from solar disk centre for a flare to be "Earth-directed"
    // If the source location is beyond this, the flare poses minimal/no risk.
    private static final int EARTH_DIRECTED_LIMIT_DEG = 30;

    // ─────────────────────────────────────────────────────────────────────────
    //  ASTEROID — uses SAFE / WATCH / CRITICAL
    // ─────────────────────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────────────────────
    //  SOLAR FLARE — uses its own space-weather scale
    //                 MINOR / MODERATE / SEVERE / EXTREME / CRITICAL
    // ─────────────────────────────────────────────────────────────────────────
    public RiskEvent classifySolarFlare(SolarFlareEvent event) {
        String classType = event.classType() != null ? event.classType().toUpperCase() : "";

        // 1. Parse the class letter and magnitude
        char   flareClass;
        double magnitude = 0;

        Matcher classMatcher = CLASS_TYPE_PATTERN.matcher(classType);
        if (classMatcher.matches()) {
            flareClass = classMatcher.group(1).charAt(0);
            if (classMatcher.group(2) != null) {
                try {
                    magnitude = Double.parseDouble(classMatcher.group(2));
                } catch (NumberFormatException e) {
                    magnitude = 0;
                }
            }
        } else {
            flareClass = 'A';
        }

        // 2. Check if the flare is Earth-directed (based on sourceLocation)
        boolean earthDirected = isEarthDirected(event.sourceLocation());

        // 3. Classify based on class + magnitude + Earth-direction
        String level;
        int    score;
        String reason;

        if (!earthDirected) {
            level  = "MINOR";
            score  = 5;
            reason = "%s-class solar flare detected at %s — not Earth-directed, no impact expected."
                    .formatted(event.classType(), event.sourceLocation() != null ? event.sourceLocation() : "unknown");
        } else if (flareClass == 'X') {
            if (magnitude >= 10) {
                level  = "CRITICAL";
                score  = 98;
                reason = "X%.1f-class solar flare (%s) detected — R5-level event. Global radio blackouts, widespread satellite disruption, and geomagnetic storms likely."
                        .formatted(magnitude, event.classType());
            } else {
                level  = "EXTREME";
                score  = 85;
                reason = "X-class solar flare (%s) detected — R4-level event. Wide-area radio blackouts, possible satellite and power grid impacts."
                        .formatted(event.classType());
            }
        } else if (flareClass == 'M') {
            if (magnitude >= 5) {
                level  = "SEVERE";
                score  = 70;
                reason = "M%.1f-class solar flare (%s) detected — R3-level event. Strong radio blackouts on the sunlit side of Earth."
                        .formatted(magnitude, event.classType());
            } else {
                level  = "MODERATE";
                score  = 45;
                reason = "M%.1f-class solar flare (%s) detected — R1–R2 level. Minor to moderate radio blackouts possible."
                        .formatted(magnitude, event.classType());
            }
        } else {
            // A, B, C class
            level  = "MINOR";
            score  = 10;
            reason = "%s-class solar flare detected — no significant space weather impact expected."
                    .formatted(event.classType());
        }

        return new RiskEvent(event.flrId(), "SOLAR_FLARE", level, score, reason);
    }

    /**
     * Parses NASA DONKI sourceLocation (e.g. "N25W45", "S15E30") and determines
     * if the flare is directed toward Earth.
     * <p>
     * A flare is Earth-directed when its source region is within ~30° of the
     * centre of the solar disk (low heliographic latitude and near central
     * meridian).
     */
    private boolean isEarthDirected(String sourceLocation) {
        if (sourceLocation == null || sourceLocation.isBlank()) {
            // No location data — assume the worst (conservative)
            return true;
        }

        Matcher m = SOURCE_LOC_PATTERN.matcher(sourceLocation.trim());
        if (!m.matches()) {
            // Unparseable location — assume Earth-directed to be safe
            return true;
        }

        int latitude  = Integer.parseInt(m.group(2));
        int longitude = Integer.parseInt(m.group(4));

        // Latitude: N/S doesn't matter for Earth-direction, just the magnitude
        // Longitude: E/W indicates how far from central meridian
        //   Lower longitude = more Earth-directed
        return latitude <= EARTH_DIRECTED_LIMIT_DEG && longitude <= EARTH_DIRECTED_LIMIT_DEG;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  FIREBALL — uses SAFE / WATCH / CRITICAL
    // ─────────────────────────────────────────────────────────────────────────
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
