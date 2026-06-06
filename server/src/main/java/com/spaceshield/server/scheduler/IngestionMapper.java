package com.spaceshield.server.scheduler;

import com.spaceshield.server.client.response.FireballDto;
import com.spaceshield.server.client.response.SolarFlareDto;
import com.spaceshield.server.client.response.NearEarthObjectDto;
import com.spaceshield.server.kafka.event.AsteroidEvent;
import com.spaceshield.server.kafka.event.FireballEvent;
import com.spaceshield.server.kafka.event.SolarFlareEvent;
import org.springframework.stereotype.Component;

@Component
public class IngestionMapper {

    public AsteroidEvent toAsteroidEvent(NearEarthObjectDto dto) {
        var approach  = dto.closeApproachData().getFirst();
        var diameter  = dto.estimatedDiameter().kilometers();

        return new AsteroidEvent(
                dto.id(),
                dto.name(),
                diameter.min(),
                diameter.max(),
                Double.parseDouble(approach.relativeVelocity().kilometersPerSecond()),
                Double.parseDouble(approach.missDistance().kilometers()),
                approach.closeApproachDate(),
                dto.isPotentiallyHazardous()
        );
    }

    public SolarFlareEvent toSolarFlareEvent(SolarFlareDto dto) {
        return new SolarFlareEvent(
                dto.flrId(),
                dto.classType(),
                dto.beginTime(),
                dto.peakTime(),
                dto.endTime(),
                dto.sourceLocation()
        );
    }

    public FireballEvent toFireballEvent(FireballDto dto) {
        return new FireballEvent(
                dto.date(),
                dto.lat()    != null ? Double.parseDouble(dto.lat())    : null,
                dto.latDir(),
                dto.lon()    != null ? Double.parseDouble(dto.lon())    : null,
                dto.lonDir(),
                dto.alt()    != null ? Double.parseDouble(dto.alt())    : null,
                Double.parseDouble(dto.energy()),
                Double.parseDouble(dto.impactEnergy())
        );
    }
}