'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useReceptionSidebar } from '../components/ReceptionSidebarContext';
import {
  Building2,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Bed,
  FileText,
  X,
  ShieldCheck,
  ChevronRight,
  Filter
} from 'lucide-react';

interface Admission {
  id: number;
  admissionNumber: string;
  patientId: number;
  patientName?: string;
  patientMrn?: string;
  hospitalId: number;
  departmentId: number;
  departmentName?: string;
  admittingDoctorId: number;
  doctorName?: string;
  admissionDate: string;
  admissionTime: string;
  admissionType: string;
  status: 'REQUESTED' | 'ADMITTED' | 'DISCHARGED' | 'CANCELLED';
  wardId?: number;
  roomId?: number;
  bedId?: number;
  bedNumber?: string;
  initiatingStaffUserId?: string;
  reason: string;
  notes?: string;
  createdAt: string;
}

interface Patient {
  id: number;
  mrn: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface Doctor {
  id: number;
  name: string;
  departmentId?: number;
  departmentName?: string;
}

interface Department {
  id: number;
  name: string;
}

interface BedInfo {
  id: number;
  bedNumber: string;
  bedType: string;
  status: string;
}

export default function ReceptionAdmissionsPage() {
  const searchParams = useSearchParams();
  const prefillPatientId = searchParams.get('patientId');
  const { activeHospitalId } = useReceptionSidebar();

  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [beds, setBeds] = useState<BedInfo[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // New Admission Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | ''>(prefillPatientId ? Number(prefillPatientId) : '');
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | ''>('');
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');
  const [admissionType, setAdmissionType] = useState('ELECTIVE');
  const [admissionDate, setAdmissionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [admissionTime, setAdmissionTime] = useState('10:00:00');
  const [selectedBedId, setSelectedBedId] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status update modal
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [targetAdmission, setTargetAdmission] = useState<Admission | null>(null);
  const [newStatus, setNewStatus] = useState<'ADMITTED' | 'DISCHARGED' | 'CANCELLED'>('ADMITTED');
  const [statusNotes, setStatusNotes] = useState('');
  const [assignBedId, setAssignBedId] = useState<number | ''>('');

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const hospId = activeHospitalId || 101;

      // 1. Fetch admissions from encounter-service
      const admRes = await fetch(`/api/v1/admissions?hospitalId=${hospId}`);
      let admList: Admission[] = [];
      if (admRes.ok) {
        const j = await admRes.json();
        admList = j.data || [];
      }

      // 2. Fetch patients
      const pRes = await fetch('/api/v1/patients');
      let pList: Patient[] = [];
      if (pRes.ok) {
        const j = await pRes.json();
        pList = j.data || [];
        setPatients(pList);
      }

      // 3. Fetch doctors
      const dRes = await fetch(`/api/v1/doctors?hospitalId=${hospId}`);
      let dList: Doctor[] = [];
      if (dRes.ok) {
        const j = await dRes.json();
        const raw = j.data || j || [];
        dList = raw.map((d: any) => ({
          id: d.id,
          name: d.fullName || (d.firstName ? `Dr. ${d.firstName} ${d.lastName}` : d.name || `Dr. #${d.id}`),
          departmentId: d.departmentId,
          departmentName: d.departmentName || d.specialty
        }));
        setDoctors(dList);
      }

      // 4. Fetch departments
      const deptRes = await fetch(`/api/v1/departments?hospitalId=${hospId}`);
      if (deptRes.ok) {
        const j = await deptRes.json();
        setDepartments(j.data || j || []);
      }

      // 5. Fetch beds
      const bedRes = await fetch(`/api/v1/beds?hospitalId=${hospId}`);
      if (bedRes.ok) {
        const j = await bedRes.json();
        setBeds(j.data || j || []);
      }

      // Hydrate admissions with patient and doctor details
      const hydrated = admList.map((a) => {
        const pat = pList.find((p) => p.id === a.patientId);
        const doc = dList.find((d) => d.id === a.admittingDoctorId);
        return {
          ...a,
          patientName: pat ? `${pat.firstName} ${pat.lastName}` : `Patient #${a.patientId}`,
          patientMrn: pat ? pat.mrn : '—',
          doctorName: doc ? doc.name : `Doctor #${a.admittingDoctorId}`
        };
      });

      setAdmissions(hydrated);

      // If prefilled patient ID was passed, open modal automatically
      if (prefillPatientId) {
        setSelectedPatientId(Number(prefillPatientId));
        setIsModalOpen(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load admissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [activeHospitalId]);

  const handleCreateAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId || !reason.trim()) {
      setError('Please provide patient, admitting doctor, and clinical admission reason');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        patientId: Number(selectedPatientId),
        hospitalId: activeHospitalId || 101,
        departmentId: selectedDeptId ? Number(selectedDeptId) : 101,
        admittingDoctorId: Number(selectedDoctorId),
        admissionDate,
        admissionTime,
        admissionType,
        bedId: selectedBedId ? Number(selectedBedId) : null,
        reason,
        notes
      };

      const res = await fetch('/api/v1/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || 'Failed to initiate admission');
      }

      // Log front desk audit
      await fetch('/api/v1/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: activeHospitalId || 101,
          action: 'ADMISSION_INITIATED',
          entityType: 'ADMISSION',
          entityId: String(selectedPatientId),
          details: `Inpatient admission initiated for Patient #${selectedPatientId} by Reception Desk`
        })
      }).catch(() => {});

      setSuccessMessage('Inpatient admission initiated successfully');
      setIsModalOpen(false);
      setReason('');
      setNotes('');
      await loadAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to initiate admission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAdmission) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const url = new URL(`/api/v1/admissions/${targetAdmission.id}/status`, window.location.origin);
      url.searchParams.set('status', newStatus);
      if (assignBedId) url.searchParams.set('bedId', String(assignBedId));
      if (statusNotes) url.searchParams.set('notes', statusNotes);

      const res = await fetch(url.toString(), {
        method: 'PATCH'
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || 'Failed to update admission status');
      }

      // Audit log
      await fetch('/api/v1/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: activeHospitalId || 101,
          action: `ADMISSION_${newStatus}`,
          entityType: 'ADMISSION',
          entityId: String(targetAdmission.id),
          details: `Admission #${targetAdmission.admissionNumber} transitioned to ${newStatus}`
        })
      }).catch(() => {});

      setSuccessMessage(`Admission status updated to ${newStatus}`);
      setUpdateModalOpen(false);
      setTargetAdmission(null);
      await loadAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to update admission status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAdmissions = admissions.filter((a) => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (a.patientName || '').toLowerCase().includes(q);
      const matchMrn = (a.patientMrn || '').toLowerCase().includes(q);
      const matchNum = a.admissionNumber.toLowerCase().includes(q);
      const matchDoc = (a.doctorName || '').toLowerCase().includes(q);
      return matchName || matchMrn || matchNum || matchDoc;
    }
    return true;
  });

  const requestedCount = admissions.filter((a) => a.status === 'REQUESTED').length;
  const admittedCount = admissions.filter((a) => a.status === 'ADMITTED').length;
  const dischargedCount = admissions.filter((a) => a.status === 'DISCHARGED').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Inpatient Admissions Desk
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Coordinate IPD admission initiation, bed allocation, and operational ward handoffs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedPatientId('');
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#007b92] text-white hover:bg-[#00667a] shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Initiate IPD Admission</span>
          </button>
          <button
            type="button"
            onClick={loadAllData}
            disabled={loading}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg border border-border transition-colors cursor-pointer"
            title="Refresh Admissions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Placement</p>
            <p className="text-2xl font-black text-foreground mt-1">{requestedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active Inpatients</p>
            <p className="text-2xl font-black text-foreground mt-1">{admittedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
            <Bed className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discharged</p>
            <p className="text-2xl font-black text-foreground mt-1">{dischargedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
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

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-3 rounded-xl">
        <div className="flex items-center gap-1 overflow-x-auto">
          {['ALL', 'REQUESTED', 'ADMITTED', 'DISCHARGED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#007b92] text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by patient, MRN, admission #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
          />
        </div>
      </div>

      {/* Admissions Table */}
      <div className="bg-card border border-border rounded-xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#007b92] mb-2" />
            <p className="text-xs">Loading inpatient episodes...</p>
          </div>
        ) : filteredAdmissions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Building2 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-semibold text-foreground">No Inpatient Admissions Found</p>
            <p className="text-xs text-muted-foreground mt-1">
              There are currently no admission requests matching your active filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                <tr>
                  <th className="py-3 px-4">Admission #</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Admitting Doctor</th>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Bed / Ward</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAdmissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-accent/40">
                    <td className="py-3 px-4 font-mono font-bold text-[#007b92]">
                      {adm.admissionNumber}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/staff/reception/patients/${adm.patientId}`}
                        className="font-semibold text-foreground hover:text-[#007b92] hover:underline"
                      >
                        {adm.patientName}
                      </Link>
                      <p className="text-[11px] font-mono text-muted-foreground">{adm.patientMrn}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">{adm.doctorName}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {adm.admissionDate} at {adm.admissionTime}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-foreground">{adm.admissionType}</span>
                    </td>
                    <td className="py-3 px-4">
                      {adm.bedId ? (
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-foreground">
                          <Bed className="w-3.5 h-3.5 text-[#007b92]" />
                          Bed #{adm.bedId}
                        </span>
                      ) : (
                        <span className="text-amber-600 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          adm.status === 'ADMITTED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : adm.status === 'REQUESTED'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                            : adm.status === 'DISCHARGED'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {adm.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {adm.status === 'REQUESTED' && (
                        <button
                          onClick={() => {
                            setTargetAdmission(adm);
                            setNewStatus('ADMITTED');
                            setAssignBedId(adm.bedId || '');
                            setUpdateModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                        >
                          Admit & Place
                        </button>
                      )}
                      {adm.status === 'ADMITTED' && (
                        <button
                          onClick={() => {
                            setTargetAdmission(adm);
                            setNewStatus('DISCHARGED');
                            setUpdateModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded text-[10px] font-bold"
                        >
                          Discharge
                        </button>
                      )}
                      {adm.status !== 'DISCHARGED' && adm.status !== 'CANCELLED' && (
                        <button
                          onClick={() => {
                            setTargetAdmission(adm);
                            setNewStatus('CANCELLED');
                            setUpdateModalOpen(true);
                          }}
                          className="px-2 py-1 border border-border text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded text-[10px] font-semibold"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Admission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-foreground mb-1">
              Initiate Inpatient Admission (IPD)
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Front desk administrative intake for hospital inpatient stay based on physician advice.
            </p>

            <form onSubmit={handleCreateAdmission} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Select Patient</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Admitting Doctor</label>
                  <select
                    required
                    value={selectedDoctorId}
                    onChange={(e) => {
                      const docId = Number(e.target.value);
                      setSelectedDoctorId(docId);
                      const d = doctors.find((doc) => doc.id === docId);
                      if (d?.departmentId) setSelectedDeptId(d.departmentId);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.departmentName || 'General'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Department</label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((dep) => (
                      <option key={dep.id} value={dep.id}>
                        {dep.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Admission Type</label>
                  <select
                    value={admissionType}
                    onChange={(e) => setAdmissionType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                  >
                    <option value="ELECTIVE">Elective</option>
                    <option value="EMERGENCY">Emergency</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="DAYCARE">Daycare</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                  >
                  </input>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={admissionTime}
                    onChange={(e) => setAdmissionTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Bed / Room Allocation (Optional at Intake)
                </label>
                <select
                  value={selectedBedId}
                  onChange={(e) => setSelectedBedId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                >
                  <option value="">-- Assign Later in Ward --</option>
                  {beds.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bedNumber} ({b.bedType} - {b.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Admission Reason / Physician Indication
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled elective laparoscopic cholecystectomy"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Operational Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Attendant contact, special room requests, insurance pre-auth notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#007b92] text-white rounded-lg hover:bg-[#00667a] font-semibold flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Initiate Inpatient Stay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {updateModalOpen && targetAdmission && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setUpdateModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-foreground mb-1">
              Update Admission Status
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Transition admission #{targetAdmission.admissionNumber} to {newStatus}.
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              {newStatus === 'ADMITTED' && (
                <div>
                  <label className="block font-semibold text-foreground mb-1">Allocate Bed</label>
                  <select
                    value={assignBedId}
                    onChange={(e) => setAssignBedId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                  >
                    <option value="">-- Choose Bed --</option>
                    {beds.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bedNumber} ({b.bedType})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-foreground mb-1">Operational Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Notes regarding transition"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUpdateModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#007b92] text-white rounded-lg hover:bg-[#00667a] font-semibold flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Status</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
