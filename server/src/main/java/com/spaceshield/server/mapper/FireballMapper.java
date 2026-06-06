package com.spaceshield.server.mapper;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.spaceshield.server.dto.FireballDTO;
import com.spaceshield.server.entity.Fireball;

@Mapper(componentModel = "spring")
public interface FireballMapper {

    FireballDTO toDto(Fireball entity);

    @AfterMapping
    default void computeCoordinates(Fireball entity, @MappingTarget FireballDTO dto) {
        // Convert NASA raw coordinates to decimal degrees
        if (entity.getLat() != null) {
            double lat = entity.getLat();
            if ("S".equalsIgnoreCase(entity.getLatDir())) {
                lat = -lat;
            }
            dto.setLatitude(lat);
        }

        if (entity.getLon() != null) {
            double lon = entity.getLon();
            if ("W".equalsIgnoreCase(entity.getLonDir())) {
                lon = -lon;
            }
            dto.setLongitude(lon);
        }
    }
}
