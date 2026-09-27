'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useReceptionSidebar } from '../components/ReceptionSidebarContext';
import {
  UserCheck,
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  Users,
  Building2,
  Stethoscope,
  Clock,
  RefreshCw,
  UserPlus
} from 'lucide-react';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  mrn: string;
  phone?: string;
}

interface Hospital {
  id: number;
  name: string;
  city?: string;
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
  departmentId?: number;
}

export default function ReceptionWalkInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');
  const { activeHospitalId } = useReceptionSidebar();

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  // Master Data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Walk-in Form State
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    preselectedPatientId ? Number(preselectedPatientId) : null
  );
  const [patientSearch, setPatientSearch] = useState('');
  const [hospitalId, setHospitalId] = useState<number>(activeHospitalId || 1);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [reason, setReason] = useState<string>('Walk-in Consultation');

  useEffect(() => {
    async function loadData() {
      setInitLoading(true);
      try {
        const [pRes, hRes, depRes, docRes] = await Promise.all([
          fetch('/api/proxy/api/v1/patients'),
          fetch('/api/proxy/api/v1/hospitals'),
          fetch('/api/proxy/api/v1/departments'),
          fetch('/api/proxy/api/v1/doctors'),
        ]);

        if (pRes.ok) {
          const data = await pRes.json();
          setPatients(data.data || []);
        }
        if (hRes.ok) {
          const data = await hRes.json();
          const list = data.data || [];
          setHospitals(list);
          if (list.length > 0 && !hospitalId) {
            setHospitalId(list[0].id);
          }
        }
        if (depRes.ok) {
          const data = await depRes.json();
          const list = data.data || [];
          setDepartments(list);
          if (list.length > 0) setDepartmentId(list[0].id);
        }
        if (docRes.ok) {
          const data = await docRes.json();
          const list = data.data || [];
          setDoctors(list);
          if (list.length > 0) setDoctorId(list[0].id);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to initialize walk-in data');
      } finally {
        setInitLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients.slice(0, 10);
    const q = patientSearch.toLowerCase().trim();
    return patients.filter((p) => {
      const name = `${p.firstName} ${p.lastName}`.toLowerCase();
      return name.includes(q) || p.mrn?.toLowerCase().includes(q) || p.phone?.includes(q);
    });
  }, [patients, patientSearch]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const availableDoctors = useMemo(() => {
    if (!departmentId) return doctors;
    const filtered = doctors.filter((d) => !d.departmentId || d.departmentId === departmentId);
    return filtered.length > 0 ? filtered : doctors;
  }, [doctors, departmentId]);

  // Execute Fast Walk-in Intake
  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !doctorId || !hospitalId || !departmentId) {
      setError('Please select patient, hospital, department, and doctor');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const startHour = String(now.getHours()).padStart(2, '0');
      const startMin = String(now.getMinutes()).padStart(2, '0');
      const startTime = `${startHour}:${startMin}:00`;

      // End time + 30 mins
      const endTimestamp = new Date(now.getTime() + 30 * 60 * 1000);
      const endHour = String(endTimestamp.getHours()).padStart(2, '0');
      const endMin = String(endTimestamp.getMinutes()).padStart(2, '0');
      const endTime = `${endHour}:${endMin}:00`;

      // 1. Create Appointment with source WALK_IN
      const apptPayload = {
        patientId: selectedPatientId,
        doctorId: doctorId,
        hospitalId: hospitalId,
        departmentId: departmentId,
        appointmentDate: todayStr,
        startTime: startTime,
        endTime: endTime,
        appointmentType: 'OPD',
        reason: reason.trim() || 'Walk-in Consultation',
        notes: 'Walk-in front desk arrival',
      };

      const apptRes = await fetch('/api/proxy/api/v1/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apptPayload),
      });

      if (!apptRes.ok) {
        const errJson = await apptRes.json().catch(() => ({}));
        throw new Error(errJson.message || 'Walk-in appointment slot creation failed');
      }

      const apptData = await apptRes.json();
      const appt = apptData.data;

      // 2. Confirm Appointment (check-in)
      await fetch(`/api/proxy/api/v1/appointments/${appt.id}/confirm`, {
        method: 'PATCH',
      });

      // 3. Create Open OPD Encounter for Doctor Queue
      const encPayload = {
        patientId: selectedPatientId,
        hospitalId: hospitalId,
        departmentId: departmentId,
        doctorId: doctorId,
        encounterType: 'OPD',
        appointmentId: appt.id,
        source: 'WALK_IN',
        chiefComplaint: reason.trim() || 'Walk-in Consultation',
      };

      const encRes = await fetch('/api/proxy/api/v1/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encPayload),
      });

      const encData = encRes.ok ? await encRes.json() : null;

      setSuccessData({
        appointment: appt,
        encounter: encData?.data,
        patient: selectedPatient,
      });
    } catch (err: any) {
      setError(err.message || 'Walk-in intake failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <Link
          href="/staff/reception/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Walk-in Patient Fast-Track
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          One-click arrival registration: automatically books same-day slot, confirms check-in, and places patient into Doctor Queue.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Success View */}
      {successData ? (
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xs text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">
              Walk-in Patient Checked In!
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Patient is now active in the Doctor OPD Queue and waiting room roster.
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Token / Reference:</span>
              <span className="font-mono font-bold text-[#007b92]">
                {successData.appointment?.appointmentNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Patient:</span>
              <span className="font-semibold text-foreground">
                {successData.patient?.firstName} {successData.patient?.lastName} ({successData.patient?.mrn})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Queue Status:</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                WAITING IN QUEUE
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/staff/reception/queue"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#007b92] text-white hover:bg-[#00667a] shadow-xs transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>View Live OPD Queue</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setSuccessData(null);
                setSelectedPatientId(null);
                setReason('Walk-in Consultation');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-border hover:bg-accent text-foreground transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Next Walk-in</span>
            </button>
          </div>
        </div>
      ) : (
        /* Walk-in Form */
        <form onSubmit={handleWalkInSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-6">
          {/* Patient Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#007b92]" />
                Select Walk-in Patient
              </h2>
              <Link
                href="/staff/reception/patients/new"
                className="text-xs font-semibold text-[#007b92] hover:underline"
              >
                + Register New Patient
              </Link>
            </div>

            {selectedPatient ? (
              <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-[#007b92]/30 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-foreground">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </span>
                  <div className="flex items-center gap-2 text-muted-foreground mt-0.5">
                    <span className="font-mono text-[#007b92] font-semibold">{selectedPatient.mrn}</span>
                    {selectedPatient.phone && <span>• {selectedPatient.phone}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPatientId(null)}
                  className="text-xs text-[#007b92] hover:underline font-semibold"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by Name, MRN, Phone..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto divide-y divide-border/50 border border-border rounded-lg">
                  {filteredPatients.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer flex items-center justify-between"
                    >
                      <span className="font-medium text-foreground">
                        {p.firstName} {p.lastName}
                      </span>
                      <span className="font-mono text-[11px] text-[#007b92]">{p.mrn}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hospital & Department */}
          <div className="pt-4 border-t border-border">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#007b92]" />
              Facility & Department
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">Hospital Branch</label>
                <select
                  value={hospitalId}
                  onChange={(e) => setHospitalId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} {h.city ? `(${h.city})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Department</label>
                <select
                  value={departmentId || ''}
                  onChange={(e) => setDepartmentId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Doctor Selection */}
          <div className="pt-4 border-t border-border">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-[#007b92]" />
              Attending OPD Doctor
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">Select Available Doctor</label>
                <select
                  value={doctorId || ''}
                  onChange={(e) => setDoctorId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  {availableDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.firstName} {doc.lastName} — {doc.specialization || 'Consultant'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Chief Reason for Walk-in</label>
                <input
                  type="text"
                  placeholder="e.g. Fever, acute stomach pain, blood pressure check"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <Link
              href="/staff/reception/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-border hover:bg-accent text-foreground transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !selectedPatientId}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Intake & Queueing...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Confirm Walk-in & Check In</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
