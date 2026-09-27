'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

interface Encounter {
  id: number;
  encounterNumber: string;
  patientId: number;
  doctorId: number;
  hospitalId: number;
  departmentId: number;
  encounterType: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  appointmentId?: number;
  chiefComplaint?: string;
  primaryDiagnosis?: string;
  secondaryDiagnosis?: string;
  clinicalNotes?: string;
  treatmentPlan?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  mrn: string;
}

export default function DoctorEncountersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [patients, setPatients] = useState<Record<number, Patient>>({});
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'IN_PROGRESS' | 'OPEN' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEncounters = async () => {
    setLoading(true);
    setError(null);
    try {
      const meRes = await fetch('/api/proxy/api/v1/doctors/me');
      if (!meRes.ok) throw new Error('Failed to verify doctor identity');
      const doc = (await meRes.json()).data;

      const encRes = await fetch(`/api/proxy/api/v1/encounters/doctor/${doc.id}`);
      if (!encRes.ok) throw new Error('Failed to fetch encounters');
      const encData: Encounter[] = (await encRes.json()).data || [];
      setEncounters(encData);

      const pIds = Array.from(new Set(encData.map((e) => e.patientId)));
      const pMap: Record<number, Patient> = {};

      await Promise.all(
        pIds.map(async (pid) => {
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
                };
              }
            }
          } catch {
            // continue
          }
        })
      );
      setPatients(pMap);
    } catch (err: any) {
      setError(err.message || 'Error loading encounters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEncounters();
  }, []);

  const filtered = useMemo(() => {
    return encounters.filter((enc) => {
      if (filterStatus !== 'ALL' && enc.status !== filterStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const p = patients[enc.patientId];
        const pName = `${p?.firstName || ''} ${p?.lastName || ''}`.toLowerCase();
        const mrn = (p?.mrn || '').toLowerCase();
        const num = enc.encounterNumber.toLowerCase();
        const diag = (enc.primaryDiagnosis || '').toLowerCase();

        return pName.includes(q) || mrn.includes(q) || num.includes(q) || diag.includes(q);
      }
      return true;
    });
  }, [encounters, filterStatus, searchQuery, patients]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Clinical Encounters
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Log of all active and completed consultations under your supervision.
          </p>
        </div>
        <button
          onClick={fetchEncounters}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 text-teal-600" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1">
          {(['ALL', 'IN_PROGRESS', 'OPEN', 'COMPLETED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                filterStatus === st
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {st === 'ALL' ? 'All Encounters' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search patient, MRN, diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>
      </div>

      {/* Encounters List */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Stethoscope className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No Encounters Found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              There are no encounters matching the selected status or query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-5 py-3">Encounter #</th>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Primary Diagnosis</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((enc) => {
                  const p = patients[enc.patientId];
                  return (
                    <tr key={enc.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-foreground">
                        {enc.encounterNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/doctor/patients/${enc.patientId}`}
                          className="font-bold text-foreground hover:text-teal-600 hover:underline"
                        >
                          {p ? `${p.firstName} ${p.lastName}` : `Patient #${enc.patientId}`}
                        </Link>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          MRN: {p?.mrn || 'N/A'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-medium uppercase text-muted-foreground">
                          {enc.encounterType}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 max-w-xs truncate text-xs font-medium text-foreground">
                        {enc.primaryDiagnosis || <span className="text-muted-foreground italic">None documented</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${
                          enc.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : enc.status === 'IN_PROGRESS'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                        }`}>
                          {enc.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground font-mono">
                        {enc.createdAt?.split('T')[0]}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/doctor/consultation/${enc.id}`}
                          className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>{enc.status === 'COMPLETED' ? 'View' : 'Resume'}</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
