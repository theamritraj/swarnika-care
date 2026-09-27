import os

base_pkg = "package com.swarnikacare.nursing.entity;\n\n"
imports = """import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.math.BigDecimal;

"""

entities = {
    "ShiftTemplate.java": """@Entity
@Table(name = "shift_templates", uniqueConstraints = {@UniqueConstraint(columnNames = {"hospital_id", "code"})})
public class ShiftTemplate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;
    @Column(nullable = false, length = 100)
    private String name;
    @Column(nullable = false, length = 50)
    private String code;
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;
    private Boolean active = true;
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
""",
    "Roster.java": """@Entity
@Table(name = "rosters", uniqueConstraints = {@UniqueConstraint(columnNames = {"hospital_id", "unit_id", "roster_date", "shift_template_id"})})
public class Roster {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;
    @Column(name = "unit_id", nullable = false)
    private Long unitId;
    @Column(name = "roster_date", nullable = false)
    private LocalDate rosterDate;
    @Column(name = "shift_template_id", nullable = false)
    private Long shiftTemplateId;
    @Column(length = 50)
    private String status = "DRAFT";
    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy;
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }
    public LocalDate getRosterDate() { return rosterDate; }
    public void setRosterDate(LocalDate rosterDate) { this.rosterDate = rosterDate; }
    public Long getShiftTemplateId() { return shiftTemplateId; }
    public void setShiftTemplateId(Long shiftTemplateId) { this.shiftTemplateId = shiftTemplateId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
""",
    "NurseDutyAssignment.java": """@Entity
@Table(name = "nurse_duty_assignments", uniqueConstraints = {@UniqueConstraint(columnNames = {"nurse_user_id", "roster_id"})})
public class NurseDutyAssignment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "roster_id", nullable = false)
    private Long rosterId;
    @Column(name = "nurse_user_id", nullable = false, length = 100)
    private String nurseUserId;
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;
    @Column(name = "unit_id", nullable = false)
    private Long unitId;
    @Column(name = "shift_template_id", nullable = false)
    private Long shiftTemplateId;
    @Column(name = "assignment_status", length = 50)
    private String assignmentStatus = "ASSIGNED";
    @Column(name = "assigned_at")
    private LocalDateTime assignedAt = LocalDateTime.now();
    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getRosterId() { return rosterId; }
    public void setRosterId(Long rosterId) { this.rosterId = rosterId; }
    public String getNurseUserId() { return nurseUserId; }
    public void setNurseUserId(String nurseUserId) { this.nurseUserId = nurseUserId; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }
    public Long getShiftTemplateId() { return shiftTemplateId; }
    public void setShiftTemplateId(Long shiftTemplateId) { this.shiftTemplateId = shiftTemplateId; }
    public String getAssignmentStatus() { return assignmentStatus; }
    public void setAssignmentStatus(String assignmentStatus) { this.assignmentStatus = assignmentStatus; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
""",
    "PatientAssignment.java": """@Entity
@Table(name = "patient_assignments")
public class PatientAssignment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;
    @Column(name = "unit_id", nullable = false)
    private Long unitId;
    @Column(name = "room_id", nullable = false)
    private Long roomId;
    @Column(name = "bed_id", nullable = false)
    private Long bedId;
    @Column(name = "admission_id", nullable = false)
    private Long admissionId;
    @Column(name = "patient_id", nullable = false)
    private Long patientId;
    @Column(name = "nurse_user_id", nullable = false, length = 100)
    private String nurseUserId;
    @Column(name = "roster_id", nullable = false)
    private Long rosterId;
    @Column(name = "assigned_at")
    private LocalDateTime assignedAt = LocalDateTime.now();
    @Column(name = "unassigned_at")
    private LocalDateTime unassignedAt;
    @Column(length = 50)
    private String status = "ACTIVE";
    @Column(name = "assignment_notes", columnDefinition = "TEXT")
    private String assignmentNotes;
    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }
    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }
    public Long getBedId() { return bedId; }
    public void setBedId(Long bedId) { this.bedId = bedId; }
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getNurseUserId() { return nurseUserId; }
    public void setNurseUserId(String nurseUserId) { this.nurseUserId = nurseUserId; }
    public Long getRosterId() { return rosterId; }
    public void setRosterId(Long rosterId) { this.rosterId = rosterId; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
    public LocalDateTime getUnassignedAt() { return unassignedAt; }
    public void setUnassignedAt(LocalDateTime unassignedAt) { this.unassignedAt = unassignedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAssignmentNotes() { return assignmentNotes; }
    public void setAssignmentNotes(String assignmentNotes) { this.assignmentNotes = assignmentNotes; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
""",
    "Vitals.java": """@Entity
@Table(name = "vitals")
public class Vitals {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "patient_id", nullable = false)
    private Long patientId;
    @Column(name = "admission_id", nullable = false)
    private Long admissionId;
    @Column(name = "encounter_id")
    private Long encounterId;
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;
    @Column(name = "unit_id", nullable = false)
    private Long unitId;
    
    private BigDecimal temperature;
    private Integer pulse;
    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;
    @Column(name = "systolic_bp")
    private Integer systolicBp;
    @Column(name = "diastolic_bp")
    private Integer diastolicBp;
    @Column(name = "oxygen_saturation")
    private Integer oxygenSaturation;
    @Column(name = "blood_glucose")
    private BigDecimal bloodGlucose;
    private BigDecimal weight;
    private BigDecimal height;
    @Column(name = "pain_score")
    private Integer painScore;
    @Column(name = "consciousness_state", length = 100)
    private String consciousnessState;
    @Column(columnDefinition = "TEXT")
    private String notes;
    @Column(name = "recorded_at")
    private LocalDateTime recordedAt = LocalDateTime.now();
    @Column(name = "recorded_by", nullable = false, length = 100)
    private String recordedBy;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public Long getEncounterId() { return encounterId; }
    public void setEncounterId(Long encounterId) { this.encounterId = encounterId; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }
    public BigDecimal getTemperature() { return temperature; }
    public void setTemperature(BigDecimal temperature) { this.temperature = temperature; }
    public Integer getPulse() { return pulse; }
    public void setPulse(Integer pulse) { this.pulse = pulse; }
    public Integer getRespiratoryRate() { return respiratoryRate; }
    public void setRespiratoryRate(Integer respiratoryRate) { this.respiratoryRate = respiratoryRate; }
    public Integer getSystolicBp() { return systolicBp; }
    public void setSystolicBp(Integer systolicBp) { this.systolicBp = systolicBp; }
    public Integer getDiastolicBp() { return diastolicBp; }
    public void setDiastolicBp(Integer diastolicBp) { this.diastolicBp = diastolicBp; }
    public Integer getOxygenSaturation() { return oxygenSaturation; }
    public void setOxygenSaturation(Integer oxygenSaturation) { this.oxygenSaturation = oxygenSaturation; }
    public BigDecimal getBloodGlucose() { return bloodGlucose; }
    public void setBloodGlucose(BigDecimal bloodGlucose) { this.bloodGlucose = bloodGlucose; }
    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }
    public BigDecimal getHeight() { return height; }
    public void setHeight(BigDecimal height) { this.height = height; }
    public Integer getPainScore() { return painScore; }
    public void setPainScore(Integer painScore) { this.painScore = painScore; }
    public String getConsciousnessState() { return consciousnessState; }
    public void setConsciousnessState(String consciousnessState) { this.consciousnessState = consciousnessState; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }
    public String getRecordedBy() { return recordedBy; }
    public void setRecordedBy(String recordedBy) { this.recordedBy = recordedBy; }
}
""",
    "NursingAssessment.java": """@Entity
@Table(name = "nursing_assessments")
public class NursingAssessment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "patient_id", nullable = false)
    private Long patientId;
    @Column(name = "admission_id", nullable = false)
    private Long admissionId;
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;
    @Column(name = "general_condition", length = 100)
    private String generalCondition;
    @Column(length = 100)
    private String consciousness;
    @Column(name = "pain_assessment", length = 100)
    private String painAssessment;
    @Column(length = 100)
    private String mobility;
    @Column(name = "fall_risk", length = 100)
    private String fallRisk;
    @Column(length = 100)
    private String nutrition;
    @Column(name = "skin_assessment", length = 100)
    private String skinAssessment;
    @Column(length = 100)
    private String elimination;
    @Column(name = "allergy_awareness_flag")
    private Boolean allergyAwarenessFlag = false;
    @Column(name = "nursing_observations", columnDefinition = "TEXT")
    private String nursingObservations;
    @Column(name = "assessment_status", length = 50)
    private String assessmentStatus = "DRAFT";
    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy;
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public String getGeneralCondition() { return generalCondition; }
    public void setGeneralCondition(String generalCondition) { this.generalCondition = generalCondition; }
    public String getConsciousness() { return consciousness; }
    public void setConsciousness(String consciousness) { this.consciousness = consciousness; }
    public String getPainAssessment() { return painAssessment; }
    public void setPainAssessment(String painAssessment) { this.painAssessment = painAssessment; }
    public String getMobility() { return mobility; }
    public void setMobility(String mobility) { this.mobility = mobility; }
    public String getFallRisk() { return fallRisk; }
    public void setFallRisk(String fallRisk) { this.fallRisk = fallRisk; }
    public String getNutrition() { return nutrition; }
    public void setNutrition(String nutrition) { this.nutrition = nutrition; }
    public String getSkinAssessment() { return skinAssessment; }
    public void setSkinAssessment(String skinAssessment) { this.skinAssessment = skinAssessment; }
    public String getElimination() { return elimination; }
    public void setElimination(String elimination) { this.elimination = elimination; }
    public Boolean getAllergyAwarenessFlag() { return allergyAwarenessFlag; }
    public void setAllergyAwarenessFlag(Boolean allergyAwarenessFlag) { this.allergyAwarenessFlag = allergyAwarenessFlag; }
    public String getNursingObservations() { return nursingObservations; }
    public void setNursingObservations(String nursingObservations) { this.nursingObservations = nursingObservations; }
    public String getAssessmentStatus() { return assessmentStatus; }
    public void setAssessmentStatus(String assessmentStatus) { this.assessmentStatus = assessmentStatus; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
""",
    "NursingNote.java": """@Entity
@Table(name = "nursing_notes")
public class NursingNote {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "patient_id", nullable = false)
    private Long patientId;
    @Column(name = "admission_id", nullable = false)
    private Long admissionId;
    @Column(name = "encounter_id")
    private Long encounterId;
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;
    @Column(name = "nurse_user_id", nullable = false, length = 100)
    private String nurseUserId;
    @Column(name = "note_type", nullable = false, length = 50)
    private String noteType;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    @Column(length = 50)
    private String status = "FINAL";
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public Long getEncounterId() { return encounterId; }
    public void setEncounterId(Long encounterId) { this.encounterId = encounterId; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public String getNurseUserId() { return nurseUserId; }
    public void setNurseUserId(String nurseUserId) { this.nurseUserId = nurseUserId; }
    public String getNoteType() { return noteType; }
    public void setNoteType(String noteType) { this.noteType = noteType; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
""",
    "CareTask.java": """@Entity
@Table(name = "care_tasks")
public class CareTask {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "patient_id", nullable = false)
    private Long patientId;
    @Column(name = "admission_id", nullable = false)
    private Long admissionId;
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;
    @Column(name = "unit_id", nullable = false)
    private Long unitId;
    @Column(name = "assigned_nurse_user_id", length = 100)
    private String assignedNurseUserId;
    @Column(name = "task_type", nullable = false, length = 100)
    private String taskType;
    @Column(length = 50)
    private String priority = "ROUTINE";
    @Column(length = 50)
    private String status = "PENDING";
    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;
    @Column(name = "due_at")
    private LocalDateTime dueAt;
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    @Column(columnDefinition = "TEXT")
    private String notes;
    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy;
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }
    public String getAssignedNurseUserId() { return assignedNurseUserId; }
    public void setAssignedNurseUserId(String assignedNurseUserId) { this.assignedNurseUserId = assignedNurseUserId; }
    public String getTaskType() { return taskType; }
    public void setTaskType(String taskType) { this.taskType = taskType; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public LocalDateTime getDueAt() { return dueAt; }
    public void setDueAt(LocalDateTime dueAt) { this.dueAt = dueAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
""",
    "ShiftHandover.java": """@Entity
@Table(name = "shift_handovers")
public class ShiftHandover {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;
    @Column(name = "unit_id", nullable = false)
    private Long unitId;
    @Column(name = "roster_id", nullable = false)
    private Long rosterId;
    @Column(name = "from_nurse_user_id", nullable = false, length = 100)
    private String fromNurseUserId;
    @Column(name = "to_nurse_user_id", nullable = false, length = 100)
    private String toNurseUserId;
    @Column(name = "patient_assignment_id")
    private Long patientAssignmentId;
    @Column(name = "admission_id", nullable = false)
    private Long admissionId;
    @Column(columnDefinition = "TEXT")
    private String summary;
    @Column(name = "pending_tasks", columnDefinition = "TEXT")
    private String pendingTasks;
    @Column(name = "important_observations", columnDefinition = "TEXT")
    private String importantObservations;
    @Column(name = "pending_investigations", columnDefinition = "TEXT")
    private String pendingInvestigations;
    @Column(name = "pending_medication_actions", columnDefinition = "TEXT")
    private String pendingMedicationActions;
    @Column(length = 50)
    private String status = "DRAFT";
    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }
    public Long getRosterId() { return rosterId; }
    public void setRosterId(Long rosterId) { this.rosterId = rosterId; }
    public String getFromNurseUserId() { return fromNurseUserId; }
    public void setFromNurseUserId(String fromNurseUserId) { this.fromNurseUserId = fromNurseUserId; }
    public String getToNurseUserId() { return toNurseUserId; }
    public void setToNurseUserId(String toNurseUserId) { this.toNurseUserId = toNurseUserId; }
    public Long getPatientAssignmentId() { return patientAssignmentId; }
    public void setPatientAssignmentId(Long patientAssignmentId) { this.patientAssignmentId = patientAssignmentId; }
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getPendingTasks() { return pendingTasks; }
    public void setPendingTasks(String pendingTasks) { this.pendingTasks = pendingTasks; }
    public String getImportantObservations() { return importantObservations; }
    public void setImportantObservations(String importantObservations) { this.importantObservations = importantObservations; }
    public String getPendingInvestigations() { return pendingInvestigations; }
    public void setPendingInvestigations(String pendingInvestigations) { this.pendingInvestigations = pendingInvestigations; }
    public String getPendingMedicationActions() { return pendingMedicationActions; }
    public void setPendingMedicationActions(String pendingMedicationActions) { this.pendingMedicationActions = pendingMedicationActions; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getAcknowledledgedAt() { return acknowledgedAt; }
    public void setAcknowledledgedAt(LocalDateTime acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
""",
    "MedicationAdministrationRecord.java": """@Entity
@Table(name = "medication_administration_records")
public class MedicationAdministrationRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "patient_id", nullable = false)
    private Long patientId;
    @Column(name = "admission_id", nullable = false)
    private Long admissionId;
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;
    @Column(name = "nurse_user_id", nullable = false, length = 100)
    private String nurseUserId;
    @Column(name = "medication_order_id", nullable = false)
    private Long medicationOrderId;
    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;
    @Column(name = "administered_at")
    private LocalDateTime administeredAt;
    @Column(name = "dose_administered", length = 100)
    private String doseAdministered;
    @Column(length = 100)
    private String route;
    @Column(length = 50)
    private String status = "SCHEDULED";
    @Column(columnDefinition = "TEXT")
    private String reason;
    @Column(columnDefinition = "TEXT")
    private String notes;
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public String getNurseUserId() { return nurseUserId; }
    public void setNurseUserId(String nurseUserId) { this.nurseUserId = nurseUserId; }
    public Long getMedicationOrderId() { return medicationOrderId; }
    public void setMedicationOrderId(Long medicationOrderId) { this.medicationOrderId = medicationOrderId; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public LocalDateTime getAdministeredAt() { return administeredAt; }
    public void setAdministeredAt(LocalDateTime administeredAt) { this.administeredAt = administeredAt; }
    public String getDoseAdministered() { return doseAdministered; }
    public void setDoseAdministered(String doseAdministered) { this.doseAdministered = doseAdministered; }
    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
"""
}

out_dir = "/Users/amritraj/Desktop/Amrit Raj/Projects/swarnika-care/backend/nursing-service/src/main/java/com/swarnikacare/nursing/entity/"

for fname, content in entities.items():
    with open(os.path.join(out_dir, fname), "w") as f:
        f.write(base_pkg + imports + content)
    print(f"Generated {fname}")
