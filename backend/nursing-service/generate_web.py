import os

services = [
    "PatientAssignmentService", "VitalsService"
]

out_dir_service = "/Users/amritraj/Desktop/Amrit Raj/Projects/swarnika-care/backend/nursing-service/src/main/java/com/swarnikacare/nursing/service/"

base_pkg_service = "package com.swarnikacare.nursing.service;\n\n"
imports_service = """import com.swarnikacare.nursing.entity.*;
import com.swarnikacare.nursing.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.time.LocalDateTime;

"""

for svc in services:
    content = f"""@Service
public class {svc} {{
    @Autowired
    private {svc.replace('Service', '')}Repository repository;

    public List<{svc.replace('Service', '')}> findAll() {{
        return repository.findAll();
    }}
    
    public {svc.replace('Service', '')} save({svc.replace('Service', '')} entity) {{
        return repository.save(entity);
    }}
}}
"""
    with open(os.path.join(out_dir_service, f"{svc}.java"), "w") as f:
        f.write(base_pkg_service + imports_service + content)

controllers = [
    "NursingController"
]

out_dir_controller = "/Users/amritraj/Desktop/Amrit Raj/Projects/swarnika-care/backend/nursing-service/src/main/java/com/swarnikacare/nursing/controller/"

base_pkg_controller = "package com.swarnikacare.nursing.controller;\n\n"
imports_controller = """import com.swarnikacare.nursing.entity.*;
import com.swarnikacare.nursing.service.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@RestController
@RequestMapping("/api/v1/nursing")
"""

content = """public class NursingController {

    @Autowired
    private PatientAssignmentService assignmentService;

    @Autowired
    private VitalsService vitalsService;

    @GetMapping("/patients/assignments")
    public List<PatientAssignment> getAssignments() {
        return assignmentService.findAll();
    }

    @PostMapping("/patients/{patientId}/vitals")
    public Vitals recordVitals(@PathVariable Long patientId, @RequestBody Vitals vitals) {
        vitals.setPatientId(patientId);
        return vitalsService.save(vitals);
    }
}
"""

with open(os.path.join(out_dir_controller, "NursingController.java"), "w") as f:
    f.write(base_pkg_controller + imports_controller + content)

print("Generated services and controllers.")
