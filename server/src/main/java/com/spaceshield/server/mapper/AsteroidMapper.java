package com.spaceshield.server.mapper;

import org.mapstruct.Mapper;
import com.spaceshield.server.dto.AsteroidDTO;
import com.spaceshield.server.entity.Asteroid;

@Mapper(componentModel = "spring")
public interface AsteroidMapper {
    AsteroidDTO toDto(Asteroid entity);
}
