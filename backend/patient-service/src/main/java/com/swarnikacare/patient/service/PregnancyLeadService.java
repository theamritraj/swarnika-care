package com.swarnikacare.patient.service;

import com.swarnikacare.patient.dto.PregnancyLeadRequest;
import com.swarnikacare.patient.entity.PregnancyLead;

public interface PregnancyLeadService {
    PregnancyLead createLead(PregnancyLeadRequest request);
}
