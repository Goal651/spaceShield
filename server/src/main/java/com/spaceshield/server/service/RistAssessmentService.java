package com.spaceshield.server.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.spaceshield.server.dto.RiskAssessmentDTO;
import com.spaceshield.server.entity.RiskAssessment;
import com.spaceshield.server.mapper.RiskAssessmentMapper;
import com.spaceshield.server.repository.RiskAssessmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RistAssessmentService {
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final RiskAssessmentMapper riskAssessmentMapper;

    public RiskAssessmentDTO save(RiskAssessment data) {
        RiskAssessment riskAssessment = riskAssessmentRepository.save(data);
        return riskAssessmentMapper.toDto(riskAssessment);
    }

    public List<RiskAssessmentDTO> findAll() {
        return riskAssessmentRepository.findAll()
                .stream()
                .map(riskAssessmentMapper::toDto)
                .collect(Collectors.toList());
    }

    public RiskAssessmentDTO findById(Long id) {
        return riskAssessmentRepository.findById(id).map(riskAssessmentMapper::toDto).orElse(null);
    }
    
}
