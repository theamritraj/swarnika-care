package com.swarnikacare.nursing.service;

import com.swarnikacare.nursing.entity.NursingNote;
import com.swarnikacare.nursing.repository.NursingNoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NursingNoteService {
    @Autowired
    private NursingNoteRepository repository;

    public List<NursingNote> findByPatientId(Long patientId) {
        return repository.findAll().stream().filter(n -> n.getPatientId().equals(patientId)).toList();
    }
    
    public NursingNote save(NursingNote note) {
        return repository.save(note);
    }
}
