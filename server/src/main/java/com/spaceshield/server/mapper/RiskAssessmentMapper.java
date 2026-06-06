package com.spaceshield.server.mapper;

import org.mapstruct.Mapper;

import com.spaceshield.server.dto.RiskAssessmentDTO;
import com.spaceshield.server.entity.RiskAssessment;

@Mapper(componentModel = "spring")
public interface RiskAssessmentMapper {
    RiskAssessmentDTO toDto(RiskAssessment riskAssessment);
}
