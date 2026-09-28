'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity,
  Bed,
  CheckCircle,
  Clock,
  Filter,
  Plus,
  RefreshCw,
  Search,
  User,
  AlertCircle,
  FileText,
  DollarSign,
  LogOut,
  Stethoscope,
  ChevronRight
} from 'lucide-react';

interface Admission {
  id: number;
  admissionNumber: string;
  patientId: number;
  hospitalId: number;
  departmentId: number;
  admittingDoctorId: number;
  admissionDate: string;
  admissionTime: string;
  admissionType: string;
  status: 'REQUESTED' | 'ADMITTED' | 'DISCHARGED' | 'CANCELLED';
  wardId?: number;
  roomId?: number;
  bedId?: number;
  reason: string;
  notes?: string;
  patientName?: string;
  patientMrn?: string;
  doctorName?: string;
  bedNumber?: string;
}

interface Hospital {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialization?: string;
}

interface Patient {
  id: number;
  mrn: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
}

interface DayCareBed {
  id: number;
  bedNumber: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLEANING';
  roomId: number;
  roomName?: string;
}

export default function DayCareOperationsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [beds, setBeds] = useState<DayCareBed[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [isNewAdmissionModalOpen, setIsNewAdmissionModalOpen] = useState(false);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);

  // New Admission Form state
  const [formPatientId, setFormPatientId] = useState<number | ''>('');
  const [formDepartmentId, setFormDepartmentId] = useState<number | ''>('');
  const [formDoctorId, setFormDoctorId] = useState<number | ''>('');
  const [formBedId, setFormBedId] = useState<number | ''>('');
  const [formReason, setFormReason] = useState('Day Care Chemotherapy / Minor Procedure');
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vitals Form state
  const [vitalsTemp, setVitalsTemp] = useState('98.6');
  const [vitalsPulse, setVitalsPulse] = useState('78');
  const [vitalsSys, setVitalsSys] = useState('120');
  const [vitalsDia, setVitalsDia] = useState('80');
  const [vitalsSpo2, setVitalsSpo2] = useState('99');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch hospitals
      const hRes = await fetch('/api/proxy/api/v1/hospitals');
      if (hRes.ok) {
        const hData = await hRes.json();
        const hospList = hData.data || (Array.isArray(hData) ? hData : []);
        setHospitals(hospList);
        if (hospList.length > 0 && !selectedHospitalId) {
          setSelectedHospitalId(hospList[0].id);
        }
      }

      // 2. Fetch Admissions
      const admRes = await fetch('/api/proxy/api/v1/admissions');
      if (admRes.ok) {
        const admData = await admRes.json();
        const allAdms: Admission[] = admData.data || (Array.isArray(admData) ? admData : []);
        // Filter specifically for DAYCARE
        const dayCareOnly = allAdms.filter(a => a.admissionType === 'DAYCARE');
        setAdmissions(dayCareOnly);
      }

      // 3. Fetch Departments
      const deptRes = await fetch('/api/proxy/api/v1/departments');
      if (deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartments(deptData.data || (Array.isArray(deptData) ? deptData : []));
      }

      // 4. Fetch Doctors
      const docRes = await fetch('/api/proxy/api/v1/doctors');
      if (docRes.ok) {
        const docData = await docRes.json();
        setDoctors(docData.data || (Array.isArray(docData) ? docData : []));
      }

      // 5. Fetch Patients
      const patRes = await fetch('/api/proxy/api/v1/patients');
      if (patRes.ok) {
        const patData = await patRes.json();
        setPatients(patData.data || (Array.isArray(patData) ? patData : []));
      }

      // 6. Fetch Beds
      const bedsRes = await fetch('/api/proxy/api/v1/beds');
      if (bedsRes.ok) {
        const bData = await bedsRes.json();
        setBeds(bData.data || (Array.isArray(bData) ? bData : []));
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load Day Care data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPatientId || !formDepartmentId || !formDoctorId) {
      setError('Please fill in all mandatory fields (Patient, Department, Doctor)');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload: any = {
        patientId: Number(formPatientId),
        hospitalId: selectedHospitalId || 101,
        departmentId: Number(formDepartmentId),
        admittingDoctorId: Number(formDoctorId),
        admissionType: 'DAYCARE',
        reason: formReason,
        notes: formNotes
      };

      if (formBedId) {
        payload.bedId = Number(formBedId);
      }

      const res = await fetch('/api/proxy/api/v1/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to create Day Care admission');
      }

      // If bed was allocated, update bed status in organization service to OCCUPIED
      if (formBedId) {
        await fetch(`/api/proxy/api/v1/beds/${formBedId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'OCCUPIED' })
        }).catch(() => {});
      }

      setSuccessMessage('Day Care admission registered successfully');
      setIsNewAdmissionModalOpen(false);
      resetForm();
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error creating Day Care admission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmission) return;
    setIsSubmitting(true);
    try {
      const vitalsPayload = {
        patientId: selectedAdmission.patientId,
        admissionId: selectedAdmission.id,
        hospitalId: selectedAdmission.hospitalId,
        unitId: selectedAdmission.wardId || 1,
        temperature: Number(vitalsTemp),
        pulseRate: Number(vitalsPulse),
        systolicBp: Number(vitalsSys),
        diastolicBp: Number(vitalsDia),
        respiratoryRate: 18,
        oxygenSaturation: Number(vitalsSpo2),
        notes: 'Day Care Infusion & Observation Vitals'
      };

      const res = await fetch('/api/proxy/api/v1/nursing/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vitalsPayload)
      });

      if (!res.ok) {
        throw new Error('Failed to record nursing vitals');
      }

      setSuccessMessage('Day Care observation vitals recorded successfully');
      setIsVitalsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Error recording vitals');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDischargePatient = async (admission: Admission) => {
    if (!confirm(`Are you sure you want to discharge patient from Day Care Admission #${admission.admissionNumber}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/proxy/api/v1/admissions/${admission.id}/status?status=DISCHARGED&notes=Day%20Care%20Discharge%20Completed`, {
        method: 'PATCH'
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to discharge patient');
      }

      // Release bed to CLEANING if assigned
      if (admission.bedId) {
        await fetch(`/api/proxy/api/v1/beds/${admission.bedId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'CLEANING' })
        }).catch(() => {});
      }

      setSuccessMessage(`Patient successfully discharged from Day Care #${admission.admissionNumber}`);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Discharge failed');
    }
  };

  const resetForm = () => {
    setFormPatientId('');
    setFormDepartmentId('');
    setFormDoctorId('');
    setFormBedId('');
    setFormReason('Day Care Chemotherapy / Minor Procedure');
    setFormNotes('');
  };

  const filteredAdmissions = admissions.filter(a => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const num = (a.admissionNumber || '').toLowerCase();
      const reason = (a.reason || '').toLowerCase();
      return num.includes(q) || reason.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Activity className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Day Care Operations Desk</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time Day Care bed tracking, patient admissions, procedures, observations, and discharge.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => { setError(null); setIsNewAdmissionModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[#007b92] text-white hover:bg-[#006578] shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Day Care Intake
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs underline ml-4">Dismiss</button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-xs underline ml-4">Dismiss</button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Day Care Today</span>
            <Activity className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{admissions.length}</div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Currently Occupied</span>
            <Bed className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {admissions.filter(a => a.status === 'ADMITTED').length}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Requested / Queued</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {admissions.filter(a => a.status === 'REQUESTED').length}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Discharged</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {admissions.filter(a => a.status === 'DISCHARGED').length}
          </div>
        </div>
      </div>

      {/* Day Care Bed Status Grid */}
      <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Bed className="w-5 h-5 text-teal-600" />
          Day Care Recovery & Procedure Beds
        </h2>
        {beds.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3">No Day Care beds configured yet for this unit.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {beds.map(b => (
              <div
                key={b.id}
                className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center transition-all ${
                  b.status === 'OCCUPIED'
                    ? 'border-blue-300 bg-blue-500/10 text-blue-800 dark:text-blue-200'
                    : b.status === 'CLEANING'
                    ? 'border-amber-300 bg-amber-500/10 text-amber-800 dark:text-amber-200'
                    : 'border-emerald-300 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                }`}
              >
                <Bed className="w-6 h-6 mb-1" />
                <span className="font-bold text-sm">{b.bedNumber}</span>
                <span className="text-xs uppercase font-medium mt-1">{b.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search admission #, reason..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
          >
            <option value="ALL">All Statuses</option>
            <option value="REQUESTED">Requested</option>
            <option value="ADMITTED">Admitted</option>
            <option value="DISCHARGED">Discharged</option>
          </select>
        </div>
      </div>

      {/* Admissions Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground border-b border-border text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Admission #</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Reason / Procedure</th>
                <th className="px-4 py-3">Bed</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No Day Care admissions found.
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map(adm => {
                  const pat = patients.find(p => p.id === adm.patientId);
                  const doc = doctors.find(d => d.id === adm.admittingDoctorId);
                  const bed = beds.find(b => b.id === adm.bedId);

                  return (
                    <tr key={adm.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {adm.admissionNumber}
                        <div className="text-xs text-muted-foreground">{adm.admissionDate} {adm.admissionTime}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {pat ? `${pat.firstName} ${pat.lastName}` : `Patient #${adm.patientId}`}
                        </div>
                        {pat && <div className="text-xs text-muted-foreground">MRN: {pat.mrn}</div>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {doc ? `Dr. ${doc.firstName} ${doc.lastName}` : `Doctor #${adm.admittingDoctorId}`}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-foreground font-medium">
                        {adm.reason}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {bed ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600">
                            <Bed className="w-3.5 h-3.5" />
                            {bed.bedNumber}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            adm.status === 'ADMITTED'
                              ? 'bg-blue-500/10 text-blue-600'
                              : adm.status === 'DISCHARGED'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          {adm.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {adm.status === 'ADMITTED' && (
                          <>
                            <button
                              onClick={() => { setSelectedAdmission(adm); setIsVitalsModalOpen(true); }}
                              className="px-2.5 py-1 text-xs font-medium rounded-md border border-border bg-background hover:bg-muted text-foreground"
                              title="Record Vitals"
                            >
                              Vitals
                            </button>
                            <button
                              onClick={() => handleDischargePatient(adm)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white"
                              title="Discharge Patient"
                            >
                              Discharge
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Day Care Admission */}
      {isNewAdmissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">New Day Care Intake</h3>
            <form onSubmit={handleCreateAdmission} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Select Patient *</label>
                <select
                  required
                  value={formPatientId}
                  onChange={e => setFormPatientId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} (MRN: {p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Department *</label>
                  <select
                    required
                    value={formDepartmentId}
                    onChange={e => setFormDepartmentId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
                  >
                    <option value="">-- Choose Dept --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Doctor *</label>
                  <select
                    required
                    value={formDoctorId}
                    onChange={e => setFormDoctorId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>Dr. {doc.firstName} {doc.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Day Care Bed (Optional)</label>
                <select
                  value={formBedId}
                  onChange={e => setFormBedId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
                >
                  <option value="">-- None / Queue Later --</option>
                  {beds.filter(b => b.status === 'AVAILABLE').map(b => (
                    <option key={b.id} value={b.id}>Bed {b.bedNumber} (AVAILABLE)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Reason / Clinical Procedure *</label>
                <input
                  required
                  type="text"
                  value={formReason}
                  onChange={e => setFormReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsNewAdmissionModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-border bg-background hover:bg-muted text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#007b92] text-white hover:bg-[#006578]"
                >
                  {isSubmitting ? 'Registering...' : 'Register Day Care'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Observation Vitals */}
      {isVitalsModalOpen && selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Record Day Care Vitals</h3>
            <p className="text-xs text-muted-foreground">
              Admission: #{selectedAdmission.admissionNumber}
            </p>
            <form onSubmit={handleRecordVitals} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitalsTemp}
                    onChange={e => setVitalsTemp(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Pulse (bpm)</label>
                  <input
                    type="number"
                    value={vitalsPulse}
                    onChange={e => setVitalsPulse(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Systolic BP</label>
                  <input
                    type="number"
                    value={vitalsSys}
                    onChange={e => setVitalsSys(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Diastolic BP</label>
                  <input
                    type="number"
                    value={vitalsDia}
                    onChange={e => setVitalsDia(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  value={vitalsSpo2}
                  onChange={e => setVitalsSpo2(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsVitalsModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-border bg-background hover:bg-muted text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                >
                  {isSubmitting ? 'Saving...' : 'Save Vitals'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
