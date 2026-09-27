package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.HospitalCreateRequest;
import com.swarnikacare.organization.entity.Hospital;
import com.swarnikacare.organization.repository.HospitalRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    public HospitalService(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
    }

    public Hospital createHospital(HospitalCreateRequest request) {
        if (hospitalRepository.findByCode(request.getCode()).isPresent()) {
            throw new IllegalArgumentException("Hospital code already exists");
        }

        Hospital hospital = new Hospital();
        hospital.setCode(request.getCode());
        hospital.setName(request.getName());
        hospital.setType(request.getType());
        hospital.setDescription(request.getDescription());
        hospital.setPhone(request.getPhone());
        hospital.setEmail(request.getEmail());
        hospital.setEmergencyPhone(request.getEmergencyPhone());
        hospital.setAddress(request.getAddress());
        hospital.setCity(request.getCity());
        hospital.setState(request.getState());
        hospital.setCountry(request.getCountry());
        hospital.setPincode(request.getPincode());
        hospital.setLatitude(request.getLatitude());
        hospital.setLongitude(request.getLongitude());
        hospital.setTotalBeds(request.getTotalBeds());
        hospital.setIcuBeds(request.getIcuBeds());
        hospital.setEmergencyAvailable(request.getEmergencyAvailable() != null ? request.getEmergencyAvailable() : false);
        hospital.setOtAvailable(request.getOtAvailable() != null ? request.getOtAvailable() : false);
        hospital.setBloodBankAvailable(request.getBloodBankAvailable() != null ? request.getBloodBankAvailable() : false);
        hospital.setAmbulanceAvailable(request.getAmbulanceAvailable() != null ? request.getAmbulanceAvailable() : false);
        hospital.setNicuBeds(request.getNicuBeds());
        hospital.setEmergencyBeds(request.getEmergencyBeds());
        hospital.setNicuAvailable(request.getNicuAvailable() != null ? request.getNicuAvailable() : false);
        hospital.setClinicalServices(request.getClinicalServices());
        hospital.setLaboratoryService(request.getLaboratoryService());
        hospital.setBloodBankService(request.getBloodBankService());
        hospital.setPharmacyService(request.getPharmacyService());
        hospital.setRadiologyService(request.getRadiologyService());
        hospital.setStatus("ACTIVE");

        return hospitalRepository.save(hospital);
    }

    public List<Hospital> getAllHospitals() {
        return hospitalRepository.findAll();
    }

    public Hospital getHospitalById(Long id) {
        return hospitalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));
    }

    public Hospital updateHospital(Long id, HospitalCreateRequest request) {
        Hospital hospital = getHospitalById(id);
        if (request.getName() != null && !request.getName().isBlank()) hospital.setName(request.getName());
        if (request.getType() != null) hospital.setType(request.getType());
        if (request.getDescription() != null) hospital.setDescription(request.getDescription());
        if (request.getPhone() != null) hospital.setPhone(request.getPhone());
        if (request.getEmail() != null) hospital.setEmail(request.getEmail());
        if (request.getEmergencyPhone() != null) hospital.setEmergencyPhone(request.getEmergencyPhone());
        if (request.getAddress() != null) hospital.setAddress(request.getAddress());
        if (request.getCity() != null) hospital.setCity(request.getCity());
        if (request.getState() != null) hospital.setState(request.getState());
        if (request.getCountry() != null) hospital.setCountry(request.getCountry());
        if (request.getPincode() != null) hospital.setPincode(request.getPincode());
        if (request.getLatitude() != null) hospital.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) hospital.setLongitude(request.getLongitude());
        if (request.getTotalBeds() != null) hospital.setTotalBeds(request.getTotalBeds());
        if (request.getIcuBeds() != null) hospital.setIcuBeds(request.getIcuBeds());
        if (request.getEmergencyAvailable() != null) hospital.setEmergencyAvailable(request.getEmergencyAvailable());
        if (request.getOtAvailable() != null) hospital.setOtAvailable(request.getOtAvailable());
        if (request.getBloodBankAvailable() != null) hospital.setBloodBankAvailable(request.getBloodBankAvailable());
        if (request.getAmbulanceAvailable() != null) hospital.setAmbulanceAvailable(request.getAmbulanceAvailable());
        if (request.getNicuBeds() != null) hospital.setNicuBeds(request.getNicuBeds());
        if (request.getEmergencyBeds() != null) hospital.setEmergencyBeds(request.getEmergencyBeds());
        if (request.getNicuAvailable() != null) hospital.setNicuAvailable(request.getNicuAvailable());
        if (request.getClinicalServices() != null) hospital.setClinicalServices(request.getClinicalServices());
        if (request.getLaboratoryService() != null) hospital.setLaboratoryService(request.getLaboratoryService());
        if (request.getBloodBankService() != null) hospital.setBloodBankService(request.getBloodBankService());
        if (request.getPharmacyService() != null) hospital.setPharmacyService(request.getPharmacyService());
        if (request.getRadiologyService() != null) hospital.setRadiologyService(request.getRadiologyService());

        return hospitalRepository.save(hospital);
    }
}
