package com.spaceshield.server.mapper;

import org.mapstruct.Mapper;

import com.spaceshield.server.dto.FireballDTO;
import com.spaceshield.server.entity.Fireball;

@Mapper(componentModel = "spring")
public interface FireballMapper {
    FireballDTO toDto(Fireball entity);
}
