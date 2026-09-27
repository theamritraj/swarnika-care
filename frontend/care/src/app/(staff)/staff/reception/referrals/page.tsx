'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useReceptionSidebar } from '../components/ReceptionSidebarContext';
import {
  UserCheck,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Building2,
  FileText,
  X,
  CalendarPlus,
  ArrowRight,
  Share2
} from 'lucide-react';

interface Referral {
  id: number;
  referralNumber: string;
  patientId: number;
  patientName?: string;
  patientMrn?: string;
  hospitalId: number;
  fromHospitalName?: string;
  referringDoctorId?: number;
  referringDoctorName?: string;
  fromDepartmentId?: number;
  targetHospitalId: number;
  targetHospitalName?: string;
  targetDepartmentId: number;
  targetDepartmentName?: string;
  targetDoctorId?: number;
  targetDoctorName?: string;
  referralType: 'INTERNAL' | 'EXTERNAL';
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  status: 'REQUESTED' | 'ACKNOWLEDGED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  reason: string;
  clinicalNotes?: string;
  appointmentId?: number;
  administrativeNotes?: string;
  createdAt: string;
}

interface Patient {
  id: number;
  mrn: string;
  firstName: string;
  lastName: string;
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
  name: string;
  departmentId?: number;
}

export default function ReceptionReferralsPage() {
  const searchParams = useSearchParams();
  const prefillPatientId = searchParams.get('patientId');
  const { activeHospitalId } = useReceptionSidebar();

  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // New Referral Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | ''>(prefillPatientId ? Number(prefillPatientId) : '');
  const [targetHospId, setTargetHospId] = useState<number | ''>(activeHospitalId || 101);
  const [targetDeptId, setTargetDeptId] = useState<number | ''>('');
  const [targetDocId, setTargetDocId] = useState<number | ''>('');
  const [priority, setPriority] = useState<'ROUTINE' | 'URGENT' | 'EMERGENCY'>('ROUTINE');
  const [reason, setReason] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetReferral, setTargetReferral] = useState<Referral | null>(null);
  const [nextStatus, setNextStatus] = useState<Referral['status']>('ACKNOWLEDGED');
  const [statusRemarks, setStatusRemarks] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const hospId = activeHospitalId || 101;

      // 1. Fetch referrals
      const refRes = await fetch(`/api/v1/referrals?hospitalId=${hospId}`);
      let refList: Referral[] = [];
      if (refRes.ok) {
        const j = await refRes.json();
        refList = j.data || [];
      }

      // 2. Fetch supporting data
      const [pRes, hRes, dRes, docRes] = await Promise.all([
        fetch('/api/v1/patients'),
        fetch('/api/v1/hospitals'),
        fetch(`/api/v1/departments?hospitalId=${hospId}`),
        fetch(`/api/v1/doctors?hospitalId=${hospId}`)
      ]);

      let pList: Patient[] = [];
      if (pRes.ok) {
        const j = await pRes.json();
        pList = j.data || [];
        setPatients(pList);
      }

      let hList: Hospital[] = [];
      if (hRes.ok) {
        const j = await hRes.json();
        hList = j.data || j || [];
        setHospitals(hList);
      }

      let deptList: Department[] = [];
      if (dRes.ok) {
        const j = await dRes.json();
        deptList = j.data || j || [];
        setDepartments(deptList);
      }

      let docList: Doctor[] = [];
      if (docRes.ok) {
        const j = await docRes.json();
        const raw = j.data || j || [];
        docList = raw.map((d: any) => ({
          id: d.id,
          name: d.fullName || (d.firstName ? `Dr. ${d.firstName} ${d.lastName}` : d.name || `Dr. #${d.id}`),
          departmentId: d.departmentId
        }));
        setDoctors(docList);
      }

      // Hydrate referrals
      const hydrated = refList.map((r) => {
        const pat = pList.find((p) => p.id === r.patientId);
        const fromHosp = hList.find((h) => h.id === r.hospitalId);
        const toHosp = hList.find((h) => h.id === r.targetHospitalId);
        const toDept = deptList.find((d) => d.id === r.targetDepartmentId);
        const toDoc = docList.find((d) => d.id === r.targetDoctorId);

        return {
          ...r,
          patientName: pat ? `${pat.firstName} ${pat.lastName}` : `Patient #${r.patientId}`,
          patientMrn: pat ? pat.mrn : '—',
          fromHospitalName: fromHosp ? fromHosp.name : `Hospital #${r.hospitalId}`,
          targetHospitalName: toHosp ? toHosp.name : `Hospital #${r.targetHospitalId}`,
          targetDepartmentName: toDept ? toDept.name : `Department #${r.targetDepartmentId}`,
          targetDoctorName: toDoc ? toDoc.name : (r.targetDoctorId ? `Doctor #${r.targetDoctorId}` : 'Any Available Specialist')
        };
      });

      setReferrals(hydrated);

      if (prefillPatientId) {
        setSelectedPatientId(Number(prefillPatientId));
        setIsModalOpen(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeHospitalId]);

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !targetHospId || !targetDeptId || !reason.trim()) {
      setError('Please provide patient, target hospital, department, and referral reason');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        patientId: Number(selectedPatientId),
        hospitalId: activeHospitalId || 101,
        targetHospitalId: Number(targetHospId),
        targetDepartmentId: Number(targetDeptId),
        targetDoctorId: targetDocId ? Number(targetDocId) : null,
        referralType: 'INTERNAL',
        priority,
        reason,
        clinicalNotes,
        administrativeNotes: adminNotes
      };

      const res = await fetch('/api/v1/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || 'Failed to create referral');
      }

      // Front-desk audit log
      await fetch('/api/v1/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: activeHospitalId || 101,
          action: 'REFERRAL_CREATED',
          entityType: 'REFERRAL',
          entityId: String(selectedPatientId),
          details: `Referral registered for Patient #${selectedPatientId} to Dept #${targetDeptId}`
        })
      }).catch(() => {});

      setSuccessMessage('Referral created and coordinated successfully');
      setIsModalOpen(false);
      setReason('');
      setClinicalNotes('');
      setAdminNotes('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to coordinate referral');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetReferral) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const url = new URL(`/api/v1/referrals/${targetReferral.id}/status`, window.location.origin);
      url.searchParams.set('status', nextStatus);
      if (statusRemarks) url.searchParams.set('administrativeNotes', statusRemarks);

      const res = await fetch(url.toString(), {
        method: 'PATCH'
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || 'Failed to update referral status');
      }

      await fetch('/api/v1/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: activeHospitalId || 101,
          action: `REFERRAL_${nextStatus}`,
          entityType: 'REFERRAL',
          entityId: String(targetReferral.id),
          details: `Referral #${targetReferral.referralNumber} status changed to ${nextStatus}`
        })
      }).catch(() => {});

      setSuccessMessage(`Referral marked as ${nextStatus}`);
      setStatusModalOpen(false);
      setTargetReferral(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update referral status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReferrals = referrals.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (r.patientName || '').toLowerCase().includes(q);
      const matchMrn = (r.patientMrn || '').toLowerCase().includes(q);
      const matchNum = r.referralNumber.toLowerCase().includes(q);
      const matchDept = (r.targetDepartmentName || '').toLowerCase().includes(q);
      return matchName || matchMrn || matchNum || matchDept;
    }
    return true;
  });

  const requestedCount = referrals.filter((r) => r.status === 'REQUESTED').length;
  const scheduledCount = referrals.filter((r) => r.status === 'SCHEDULED' || r.status === 'ACKNOWLEDGED').length;
  const completedCount = referrals.filter((r) => r.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Referral Coordination Desk
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Coordinate inter-departmental & cross-hospital referrals, track acknowledgments, and schedule specialist consultations.
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
            <span>New Referral Request</span>
          </button>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg border border-border transition-colors cursor-pointer"
            title="Refresh Referrals"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Awaiting Intake</p>
            <p className="text-2xl font-black text-foreground mt-1">{requestedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Coordinated / Scheduled</p>
            <p className="text-2xl font-black text-foreground mt-1">{scheduledCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-black text-foreground mt-1">{completedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
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

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-3 rounded-xl">
        <div className="flex items-center gap-1 overflow-x-auto">
          {['ALL', 'REQUESTED', 'ACKNOWLEDGED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((st) => (
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
            placeholder="Search by patient, MRN, referral #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
          />
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-card border border-border rounded-xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#007b92] mb-2" />
            <p className="text-xs">Loading referrals...</p>
          </div>
        ) : filteredReferrals.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <UserCheck className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-semibold text-foreground">No Referrals Found</p>
            <p className="text-xs text-muted-foreground mt-1">
              There are no referral coordination records matching your active filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                <tr>
                  <th className="py-3 px-4">Referral #</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Target Specialty</th>
                  <th className="py-3 px-4">Target Doctor</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredReferrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-accent/40">
                    <td className="py-3 px-4 font-mono font-bold text-[#007b92]">
                      {ref.referralNumber}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/staff/reception/patients/${ref.patientId}`}
                        className="font-semibold text-foreground hover:text-[#007b92] hover:underline"
                      >
                        {ref.patientName}
                      </Link>
                      <p className="text-[11px] font-mono text-muted-foreground">{ref.patientMrn}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-foreground">{ref.targetDepartmentName}</span>
                      <p className="text-[11px] text-muted-foreground">{ref.targetHospitalName}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">{ref.targetDoctorName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          ref.priority === 'EMERGENCY'
                            ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                            : ref.priority === 'URGENT'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {ref.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ref.status === 'COMPLETED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : ref.status === 'SCHEDULED'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                            : ref.status === 'ACKNOWLEDGED'
                            ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
                            : ref.status === 'REQUESTED'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                            : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {ref.status === 'REQUESTED' && (
                        <button
                          onClick={() => {
                            setTargetReferral(ref);
                            setNextStatus('ACKNOWLEDGED');
                            setStatusModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold"
                        >
                          Acknowledge
                        </button>
                      )}
                      {(ref.status === 'REQUESTED' || ref.status === 'ACKNOWLEDGED') && (
                        <Link
                          href={`/staff/reception/appointments/new?patientId=${ref.patientId}&departmentId=${ref.targetDepartmentId}`}
                          className="px-2.5 py-1 bg-[#007b92] hover:bg-[#00667a] text-white rounded text-[10px] font-bold inline-flex items-center gap-1"
                        >
                          <CalendarPlus className="w-3 h-3" />
                          <span>Schedule Appt</span>
                        </Link>
                      )}
                      {ref.status === 'SCHEDULED' && (
                        <button
                          onClick={() => {
                            setTargetReferral(ref);
                            setNextStatus('COMPLETED');
                            setStatusModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                        >
                          Complete
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

      {/* New Referral Modal */}
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
              Create Referral Intake Request
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Front desk administrative referral intake. Routing to appropriate clinical department/hospital.
            </p>

            <form onSubmit={handleCreateReferral} className="space-y-4 text-xs">
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
                  <label className="block font-semibold text-foreground mb-1">Target Hospital</label>
                  <select
                    required
                    value={targetHospId}
                    onChange={(e) => setTargetHospId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                  >
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                  >
                    <option value="ROUTINE">Routine</option>
                    <option value="URGENT">Urgent</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Target Department / Specialty</label>
                  <select
                    required
                    value={targetDeptId}
                    onChange={(e) => setTargetDeptId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                  >
                    <option value="">-- Choose Specialty --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Target Specialist (Optional)</label>
                  <select
                    value={targetDocId}
                    onChange={(e) => setTargetDocId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                  >
                    <option value="">-- Any Available Specialist --</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Referral Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Second opinion on abnormal ECG / Cardiology evaluation"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Physician Referral Letter Notes (As provided)
                </label>
                <textarea
                  rows={2}
                  placeholder="Text from referring doctor slip"
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Administrative Notes</label>
                <textarea
                  rows={2}
                  placeholder="Patient availability, transport arrangements, insurance coverage notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
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
                  <span>Register Referral</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModalOpen && targetReferral && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setStatusModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-foreground mb-1">
              Transition Referral Status
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Update referral #{targetReferral.referralNumber} status to {nextStatus}.
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Administrative Remarks</label>
                <textarea
                  rows={3}
                  placeholder="Notes on coordination, patient contact, or scheduling confirmation"
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
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
