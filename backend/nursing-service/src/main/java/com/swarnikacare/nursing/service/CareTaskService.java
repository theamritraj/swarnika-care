package com.swarnikacare.nursing.service;

import com.swarnikacare.nursing.entity.CareTask;
import com.swarnikacare.nursing.repository.CareTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CareTaskService {
    @Autowired
    private CareTaskRepository repository;

    public List<CareTask> findMyTasks(String nurseUserId, Long hospitalId) {
        return repository.findAll().stream()
            .filter(t -> nurseUserId.equals(t.getAssignedNurseUserId()) && hospitalId.equals(t.getHospitalId()))
            .toList();
    }
    
    public CareTask save(CareTask task) {
        return repository.save(task);
    }

    public CareTask findById(Long id) {
        return repository.findById(id).orElse(null);
    }
}
