package com.swarnikacare.nursing.service;

import com.swarnikacare.nursing.entity.*;
import com.swarnikacare.nursing.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import java.time.Duration;
import java.util.List;

@Service
public class VitalsService {
    @Autowired
    private VitalsRepository repository;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public List<Vitals> findAll() {
        return repository.findAll();
    }
    
    public Vitals save(Vitals entity) {
        Vitals saved = repository.save(entity);
        if (saved.getPatientId() != null) {
            String cacheKey = "swarnika:prod:nursing:vitals:patient:" + saved.getPatientId();
            try {
                redisTemplate.opsForValue().set(cacheKey, saved, Duration.ofHours(2));
            } catch (Exception e) {}
        }
        return saved;
    }
}
