import os

base_pkg = "package com.swarnikacare.nursing.repository;\n\n"
imports = """import com.swarnikacare.nursing.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

"""

entities = [
    "ShiftTemplate", "Roster", "NurseDutyAssignment", "PatientAssignment",
    "Vitals", "NursingAssessment", "NursingNote", "CareTask",
    "ShiftHandover", "MedicationAdministrationRecord"
]

out_dir = "/Users/amritraj/Desktop/Amrit Raj/Projects/swarnika-care/backend/nursing-service/src/main/java/com/swarnikacare/nursing/repository/"

for entity in entities:
    content = f"""@Repository
public interface {entity}Repository extends JpaRepository<{entity}, Long> {{
}}
"""
    with open(os.path.join(out_dir, f"{entity}Repository.java"), "w") as f:
        f.write(base_pkg + imports + content)
    print(f"Generated {entity}Repository.java")
