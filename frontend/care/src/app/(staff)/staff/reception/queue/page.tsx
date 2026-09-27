'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useReceptionSidebar } from '../components/ReceptionSidebarContext';
import {
  Clock,
  Users,
  Stethoscope,
  CheckCircle2,
  RefreshCw,
  Search,
  Building2,
  UserCheck,
  AlertTriangle,
  Phone,
  Ticket,
  Printer,
  Volume2,
  X
} from 'lucide-react';

interface Encounter {
  id: number;
  encounterNumber: string;
  patientId: number;
  doctorId: number;
  hospitalId: number;
  departmentId: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  appointmentId?: number;
  encounterType: string;
  chiefComplaint?: string;
  createdAt?: string;
  startedAt?: string;
  completedAt?: string;
}

interface QueueToken {
  id: number;
  tokenNumber: string;
  sequenceNumber: number;
  hospitalId: number;
  departmentId: number;
  doctorId: number;
  patientId: number;
  appointmentId?: number;
  encounterId?: number;
  queueDate: string;
  status: 'WAITING' | 'CALLED' | 'IN_SERVICE' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED';
  priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  calledAt?: string;
  completedAt?: string;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  mrn: string;
  phone?: string;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialization?: string;
}

interface Department {
  id: number;
  name: string;
}

export default function ReceptionQueuePage() {
  const { activeHospitalId } = useReceptionSidebar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [tokens, setTokens] = useState<QueueToken[]>([]);
  const [patients, setPatients] = useState<Record<number, Patient>>({});
  const [doctors, setDoctors] = useState<Record<number, Doctor>>({});
  const [departments, setDepartments] = useState<Record<number, Department>>({});

  const [activeTab, setActiveTab] = useState<'ALL' | 'WAITING' | 'CALLED' | 'IN_PROGRESS' | 'COMPLETED'>('WAITING');
  const [searchFilter, setSearchFilter] = useState('');

  // Print Token Slip modal
  const [printToken, setPrintToken] = useState<QueueToken | null>(null);

  const loadQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const hospId = activeHospitalId || 101;
      const todayStr = new Date().toISOString().split('T')[0];

      const [encRes, tokenRes, docRes, deptRes] = await Promise.all([
        fetch('/api/proxy/api/v1/encounters'),
        fetch(`/api/v1/queue-tokens?hospitalId=${hospId}&queueDate=${todayStr}`),
        fetch('/api/proxy/api/v1/doctors'),
        fetch('/api/proxy/api/v1/departments')
      ]);

      let encList: Encounter[] = [];
      if (encRes.ok) {
        const data = await encRes.json();
        encList = data.data || [];
        setEncounters(encList);
      }

      if (tokenRes.ok) {
        const tData = await tokenRes.json();
        setTokens(tData.data || []);
      }

      if (docRes.ok) {
        const dData = await docRes.json();
        const dMap: Record<number, Doctor> = {};
        (dData.data || []).forEach((d: any) => {
          dMap[d.id] = {
            id: d.id,
            firstName: d.firstName || d.fullName?.split(' ')[0] || 'Dr.',
            lastName: d.lastName || d.fullName?.split(' ')[1] || `#${d.id}`,
            specialization: d.specialization || d.specialty
          };
        });
        setDoctors(dMap);
      }

      if (deptRes.ok) {
        const depData = await deptRes.json();
        const depMap: Record<number, Department> = {};
        (depData.data || depData || []).forEach((d: Department) => {
          depMap[d.id] = d;
        });
        setDepartments(depMap);
      }

      const pIds = Array.from(new Set(encList.map((e) => e.patientId)));
      const pMap: Record<number, Patient> = {};
      await Promise.all(
        pIds.slice(0, 50).map(async (pid) => {
          try {
            const pRes = await fetch(`/api/proxy/api/v1/patients/${pid}`);
            if (pRes.ok) {
              const pData = (await pRes.json()).data;
              if (pData) {
                pMap[pid] = {
                  id: pid,
                  firstName: pData.firstName,
                  lastName: pData.lastName,
                  mrn: pData.mrn,
                  phone: pData.phone
                };
              }
            }
          } catch {}
        })
      );
      setPatients(pMap);
    } catch (err: any) {
      setError(err.message || 'Failed to load live OPD queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [activeHospitalId]);

  const handleIssueToken = async (enc: Encounter) => {
    try {
      const hospId = activeHospitalId || 101;
      const res = await fetch('/api/v1/queue-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: hospId,
          departmentId: enc.departmentId || 101,
          doctorId: enc.doctorId,
          patientId: enc.patientId,
          appointmentId: enc.appointmentId || null,
          encounterId: enc.id,
          priority: enc.encounterType === 'EMERGENCY' ? 'EMERGENCY' : 'NORMAL'
        })
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || 'Failed to issue token');
      }

      const j = await res.json();
      setSuccessMessage(`Queue token ${j.data.tokenNumber} issued successfully`);
      setPrintToken(j.data);
      await loadQueue();
    } catch (err: any) {
      setError(err.message || 'Failed to issue token');
    }
  };

  const handleUpdateTokenStatus = async (tokenId: number, status: QueueToken['status']) => {
    try {
      const res = await fetch(`/api/v1/queue-tokens/${tokenId}/status?status=${status}`, {
        method: 'PATCH'
      });
      if (!res.ok) throw new Error('Failed to update token status');
      setSuccessMessage(`Token status updated to ${status}`);
      await loadQueue();
    } catch (err: any) {
      setError(err.message || 'Failed to update token status');
    }
  };

  // Today's date filter
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const todayEncounters = useMemo(() => {
    return encounters.filter((e) => {
      const matchHospital = !activeHospitalId || Number(e.hospitalId) === Number(activeHospitalId);
      const eDate = e.createdAt ? e.createdAt.split('T')[0] : todayStr;
      return matchHospital && eDate === todayStr;
    });
  }, [encounters, activeHospitalId, todayStr]);

  // Map tokens by encounter ID and appointment ID
  const tokenByEncounter = useMemo(() => {
    const map: Record<number, QueueToken> = {};
    tokens.forEach((t) => {
      if (t.encounterId) map[t.encounterId] = t;
    });
    return map;
  }, [tokens]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: todayEncounters.length,
      waiting: todayEncounters.filter((e) => {
        const tok = tokenByEncounter[e.id];
        return tok ? tok.status === 'WAITING' : e.status === 'OPEN';
      }).length,
      called: tokens.filter((t) => t.status === 'CALLED').length,
      inProgress: todayEncounters.filter((e) => {
        const tok = tokenByEncounter[e.id];
        return tok ? tok.status === 'IN_SERVICE' : e.status === 'IN_PROGRESS';
      }).length,
      completed: todayEncounters.filter((e) => e.status === 'COMPLETED').length
    };
  }, [todayEncounters, tokens, tokenByEncounter]);

  // Filtered queue items
  const filteredQueue = useMemo(() => {
    return todayEncounters.filter((e) => {
      const tok = tokenByEncounter[e.id];
      const effectiveStatus = tok ? tok.status : e.status;

      if (activeTab === 'WAITING' && effectiveStatus !== 'WAITING' && effectiveStatus !== 'OPEN') return false;
      if (activeTab === 'CALLED' && effectiveStatus !== 'CALLED') return false;
      if (activeTab === 'IN_PROGRESS' && effectiveStatus !== 'IN_PROGRESS' && effectiveStatus !== 'IN_SERVICE') return false;
      if (activeTab === 'COMPLETED' && effectiveStatus !== 'COMPLETED') return false;

      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase().trim();
        const p = patients[e.patientId];
        const d = doctors[e.doctorId];
        const matchToken = (tok?.tokenNumber || e.encounterNumber)?.toLowerCase().includes(q);
        const matchPName = p && `${p.firstName} ${p.lastName}`.toLowerCase().includes(q);
        const matchPMrn = p && p.mrn?.toLowerCase().includes(q);
        const matchDName = d && `Dr. ${d.firstName} ${d.lastName}`.toLowerCase().includes(q);

        if (!matchToken && !matchPName && !matchPMrn && !matchDName) return false;
      }

      return true;
    });
  }, [todayEncounters, activeTab, searchFilter, patients, doctors, tokenByEncounter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Live OPD Queue & Token Desk
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Deterministic token sequencing, room calling, and patient flow monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/staff/reception/walk-in"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#007b92] text-white hover:bg-[#00667a] shadow-2xs transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            <span>Fast Walk-In Check-In</span>
          </Link>
          <button
            type="button"
            onClick={loadQueue}
            disabled={loading}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg border border-border transition-colors cursor-pointer"
            title="Refresh Live Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Waiting Room</p>
          <p className="text-2xl font-black text-foreground mt-1">{counts.waiting}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Called Next</p>
          <p className="text-2xl font-black text-foreground mt-1">{counts.called}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">In Consultation</p>
          <p className="text-2xl font-black text-foreground mt-1">{counts.inProgress}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-black text-foreground mt-1">{counts.completed}</p>
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

      {/* Queue Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border rounded-xl p-3 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('WAITING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'WAITING'
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300'
                : 'text-muted-foreground hover:bg-accent'
            }`}
          >
            Waiting ({counts.waiting})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CALLED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'CALLED'
                ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300'
                : 'text-muted-foreground hover:bg-accent'
            }`}
          >
            Called ({counts.called})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('IN_PROGRESS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'IN_PROGRESS'
                ? 'bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300'
                : 'text-muted-foreground hover:bg-accent'
            }`}
          >
            In Consultation ({counts.inProgress})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'COMPLETED'
                ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300'
                : 'text-muted-foreground hover:bg-accent'
            }`}
          >
            Completed ({counts.completed})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-[#007b92] text-white'
                : 'text-muted-foreground hover:bg-accent'
            }`}
          >
            All Encounters ({counts.all})
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter queue by patient, doctor..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden"
          />
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#007b92]" />
            <span>Loading live queue roster...</span>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No patients currently in this queue status.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Patient Information</th>
                  <th className="py-3 px-4">Attending Doctor</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Complaint / Reason</th>
                  <th className="py-3 px-4">Queue State</th>
                  <th className="py-3 px-4 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredQueue.map((enc) => {
                  const patient = patients[enc.patientId];
                  const doctor = doctors[enc.doctorId];
                  const dept = departments[enc.departmentId];
                  const token = tokenByEncounter[enc.id];

                  return (
                    <tr
                      key={enc.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        {token ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-sm px-2.5 py-1 rounded bg-[#007b92]/10 text-[#007b92] border border-[#007b92]/20">
                              {token.tokenNumber}
                            </span>
                            <button
                              onClick={() => setPrintToken(token)}
                              className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded"
                              title="Print Token Slip"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleIssueToken(enc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-bold"
                          >
                            <Ticket className="w-3 h-3" />
                            <span>Issue Token</span>
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {patient ? (
                          <div>
                            <Link
                              href={`/staff/reception/patients/${patient.id}`}
                              className="font-semibold text-foreground hover:text-[#007b92] hover:underline"
                            >
                              {patient.firstName} {patient.lastName}
                            </Link>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                              <span className="font-mono text-[#007b92]">{patient.mrn}</span>
                              {patient.phone && (
                                <>
                                  <span>•</span>
                                  <span>{patient.phone}</span>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Patient #{enc.patientId}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {doctor ? (
                          <div>
                            <p className="font-medium text-foreground">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{doctor.specialization || 'OPD'}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Doctor #{enc.doctorId}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                        {dept?.name || 'General OPD'}
                      </td>
                      <td className="py-3 px-4 max-w-[200px] truncate text-muted-foreground">
                        {enc.chiefComplaint || 'Consultation Intake'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            token?.status === 'CALLED'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300'
                              : (token?.status === 'IN_SERVICE' || enc.status === 'IN_PROGRESS')
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                              : (token?.status === 'COMPLETED' || enc.status === 'COMPLETED')
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                          }`}
                        >
                          {token ? token.status : enc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {token && token.status === 'WAITING' && (
                          <button
                            onClick={() => handleUpdateTokenStatus(token.id, 'CALLED')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Call Next</span>
                          </button>
                        )}
                        {token && token.status === 'CALLED' && (
                          <button
                            onClick={() => handleUpdateTokenStatus(token.id, 'IN_SERVICE')}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold"
                          >
                            In Consultation
                          </button>
                        )}
                        {token && (
                          <button
                            onClick={() => setPrintToken(token)}
                            className="px-2 py-1 border border-border text-foreground hover:bg-accent rounded text-[10px] font-medium"
                          >
                            Slip
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Token Slip Modal */}
      {printToken && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-center space-y-4">
            <button
              onClick={() => setPrintToken(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-border/80 pb-3">
              <h3 className="font-bold text-base text-foreground">SWARNIKA HOSPITALS</h3>
              <p className="text-[11px] text-muted-foreground">Front-Desk Operational Token Receipt</p>
            </div>

            <div className="py-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-border/60 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                YOUR TOKEN NUMBER
              </p>
              <p className="font-mono font-black text-4xl text-[#007b92] tracking-wider">
                {printToken.tokenNumber}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Sequence: #{printToken.sequenceNumber} • Date: {printToken.queueDate}
              </p>
            </div>

            <div className="text-left text-xs space-y-1.5 border-t border-b border-border/60 py-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient:</span>
                <span className="font-semibold text-foreground">
                  {patients[printToken.patientId]?.firstName} {patients[printToken.patientId]?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">MRN:</span>
                <span className="font-mono font-bold text-foreground">
                  {patients[printToken.patientId]?.mrn}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor:</span>
                <span className="font-semibold text-foreground">
                  Dr. {doctors[printToken.doctorId]?.firstName} {doctors[printToken.doctorId]?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority:</span>
                <span className="font-bold text-foreground">{printToken.priority}</span>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground">
              Please proceed to the OPD waiting lounge. Your token will be called on the display board.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-[#007b92] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintToken(null)}
                className="px-4 py-2 border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-accent"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
