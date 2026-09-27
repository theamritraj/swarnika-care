'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useReceptionSidebar } from '../components/ReceptionSidebarContext';
import {
  AlertTriangle,
  ArrowLeft,
  Search,
  CheckCircle2,
  Users,
  Building2,
  Stethoscope,
  Clock,
  RefreshCw,
  Phone,
  ShieldAlert
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

export default function ReceptionEmergencyPage() {
  const router = useRouter();
  const { activeHospitalId } = useReceptionSidebar();

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  // Master Data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Emergency Intake State
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [hospitalId, setHospitalId] = useState<number>(activeHospitalId || 1);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [chiefComplaint, setChiefComplaint] = useState<string>('Acute Emergency / Trauma Arrival');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      setInitLoading(true);
      try {
        const [pRes, hRes, depRes] = await Promise.all([
          fetch('/api/proxy/api/v1/patients'),
          fetch('/api/proxy/api/v1/hospitals'),
          fetch('/api/proxy/api/v1/departments'),
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
          // Find Emergency dept or default to first
          const erDept = list.find((d: Department) => d.name?.toLowerCase().includes('emergency') || d.name?.toLowerCase().includes('casualty'));
          setDepartmentId(erDept ? erDept.id : (list[0]?.id || 1));
        }
      } catch (e: any) {
        setError(e.message || 'Failed to initialize emergency intake data');
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

  // Submit Emergency Encounter
  const handleEmergencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !hospitalId || !departmentId) {
      setError('Please select or identify patient and verify emergency department');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        patientId: selectedPatientId,
        hospitalId: hospitalId,
        departmentId: departmentId,
        encounterType: 'EMERGENCY',
        source: 'EMERGENCY',
        chiefComplaint: chiefComplaint.trim() || 'Acute Emergency Arrival',
        notes: notes.trim(),
      };

      const res = await fetch('/api/proxy/api/v1/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to dispatch emergency encounter');
      }

      const resData = await res.json();
      setSuccessData({
        encounter: resData.data,
        patient: selectedPatient,
      });
    } catch (err: any) {
      setError(err.message || 'Emergency intake failed');
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Emergency Front Desk Fast-Track
            </h1>
            <p className="text-xs text-muted-foreground">
              Immediate front-desk intake creating priority Emergency Encounter dispatched to casualty clinical team.
            </p>
          </div>
        </div>
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
        <div className="bg-card border border-red-200 dark:border-red-900/60 rounded-2xl p-6 sm:p-8 shadow-2xs text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">
              Emergency Intake Dispatched!
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Priority emergency encounter active. Clinical casualty team notified.
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Encounter Number:</span>
              <span className="font-mono font-bold text-red-600">
                {successData.encounter?.encounterNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Patient:</span>
              <span className="font-semibold text-foreground">
                {successData.patient?.firstName} {successData.patient?.lastName} ({successData.patient?.mrn})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Encounter Type:</span>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                EMERGENCY (OPEN)
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/staff/reception/queue"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#007b92] text-white hover:bg-[#00667a] shadow-xs transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>View Live Queue</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setSuccessData(null);
                setSelectedPatientId(null);
                setChiefComplaint('Acute Emergency / Trauma Arrival');
                setNotes('');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-border hover:bg-accent text-foreground transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>New Emergency Intake</span>
            </button>
          </div>
        </div>
      ) : (
        /* Emergency Form */
        <form onSubmit={handleEmergencySubmit} className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-6">
          {/* Patient Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-red-600" />
                Patient Identification
              </h2>
              <Link
                href="/staff/reception/patients/new"
                className="text-xs font-semibold text-[#007b92] hover:underline"
              >
                + Fast Register New Patient
              </Link>
            </div>

            {selectedPatient ? (
              <div className="p-3.5 rounded-xl bg-red-50/70 dark:bg-red-950/40 border border-red-300/40 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-foreground">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </span>
                  <div className="flex items-center gap-2 text-muted-foreground mt-0.5">
                    <span className="font-mono text-red-600 font-semibold">{selectedPatient.mrn}</span>
                    {selectedPatient.phone && <span>• {selectedPatient.phone}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPatientId(null)}
                  className="text-xs text-red-600 hover:underline font-semibold"
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
                    placeholder="Search patient by Name, MRN, Phone..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>

                <div className="max-h-36 overflow-y-auto divide-y divide-border/50 border border-border rounded-lg">
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

          {/* Facility & Department */}
          <div className="pt-4 border-t border-border">
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

          {/* Chief Complaint / Notes */}
          <div className="pt-4 border-t border-border space-y-3 text-xs">
            <div>
              <label className="block font-medium text-foreground mb-1">
                Emergency Arrival Reason / Chief Complaint <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acute breathlessness, chest trauma, severe bleeding"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">Front Desk Vital Observations</label>
              <textarea
                rows={2}
                placeholder="Accompanied by family, consciousness state, wheelchair required..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching to Emergency...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Dispatch Emergency Intake</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
