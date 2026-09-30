package com.swarnikacare.patient.service;

import com.swarnikacare.patient.dto.PregnancyLeadRequest;
import com.swarnikacare.patient.entity.PregnancyLead;
import com.swarnikacare.patient.repository.PregnancyLeadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PregnancyLeadServiceImpl implements PregnancyLeadService {

    private final PregnancyLeadRepository pregnancyLeadRepository;

    @Override
    @Transactional
    public PregnancyLead createLead(PregnancyLeadRequest request) {
        log.info("Creating new pregnancy lead for mobile: {}", request.getMobile());
        
        PregnancyLead lead = PregnancyLead.builder()
                .name(request.getName())
                .mobile(request.getMobile())
                .email(request.getEmail())
                .lmpDate(request.getLmpDate())
                .cycleLength(request.getCycleLength())
                .estimatedDueDate(request.getEstimatedDueDate())
                .estimatedFetalAgeWeeks(request.getEstimatedFetalAgeWeeks())
                .estimatedFetalAgeDays(request.getEstimatedFetalAgeDays())
                .status("NEW")
                .build();
                
        return pregnancyLeadRepository.save(lead);
    }
}
