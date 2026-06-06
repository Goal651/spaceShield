package com.spaceshield.server.mapper;

import org.mapstruct.Mapper;

import com.spaceshield.server.dto.SolarFlareDTO;
import com.spaceshield.server.entity.SolarFlare;

@Mapper(componentModel = "spring")
public interface SolarFlareMapper {
    SolarFlareDTO toDto(SolarFlare entity);

    SolarFlare toEntity(SolarFlareDTO dto);
}
