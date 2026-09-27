'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  Search,
  RefreshCw,
  AlertCircle,
  Eye,
  CheckCircle2,
  Calendar,
  FileText
} from 'lucide-react';

interface Encounter {
  id: number;
  encounterNumber: string;
  patientId: number;
  hospitalId: number;
  departmentId: number;
  doctorId: number;
  encounterType: string;
  status: string;
  chiefComplaint?: string;
  primaryDiagnosis?: string;
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

export default function DoctorHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Encounter[]>([]);
  const [patients, setPatients] = useState<Record<number, Patient>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const meRes = await fetch('/api/proxy/api/v1/doctors/me');
      if (!meRes.ok) throw new Error('Doctor profile verification failed');
      const doc = (await meRes.json()).data;

      const encRes = await fetch(`/api/proxy/api/v1/encounters/doctor/${doc.id}`);
      if (!encRes.ok) throw new Error('Failed to fetch historical visits');
      const encData: Encounter[] = (await encRes.json()).data || [];

      // Filter only COMPLETED encounters
      const completedOnly = encData.filter((e) => e.status === 'COMPLETED');
      completedOnly.sort((a, b) => (b.endedAt || b.createdAt).localeCompare(a.endedAt || a.createdAt));
      setHistory(completedOnly);

      const pIds = Array.from(new Set(completedOnly.map((e) => e.patientId)));
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
      setError(err.message || 'Error loading visit history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase().trim();
    return history.filter((h) => {
      const p = patients[h.patientId];
      const pName = `${p?.firstName || ''} ${p?.lastName || ''}`.toLowerCase();
      const mrn = (p?.mrn || '').toLowerCase();
      const encNum = h.encounterNumber.toLowerCase();
      const diag = (h.primaryDiagnosis || '').toLowerCase();

      return pName.includes(q) || mrn.includes(q) || encNum.includes(q) || diag.includes(q);
    });
  }, [history, searchQuery, patients]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Visit History
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Archive of finalized clinical encounters and signed medical records under your care.
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 text-teal-600" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by patient, MRN, diagnosis, encounter #..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </div>

      {/* History Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/60 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No Completed Encounters in Archive</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Completed consultations will appear in this archive once you finalize an encounter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-5 py-3">Completed Date</th>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Encounter #</th>
                  <th className="px-5 py-3">Primary Diagnosis</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((enc) => {
                  const p = patients[enc.patientId];
                  return (
                    <tr key={enc.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 text-xs text-foreground">
                        <div className="font-semibold">{enc.endedAt?.split('T')[0] || enc.createdAt?.split('T')[0]}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {enc.endedAt ? enc.endedAt.split('T')[1]?.substring(0, 5) : ''}
                        </div>
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
                      <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                        {enc.encounterNumber}
                      </td>
                      <td className="px-5 py-3.5 max-w-xs truncate text-xs font-semibold text-foreground">
                        {enc.primaryDiagnosis || <span className="text-muted-foreground italic font-normal">None recorded</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs uppercase font-medium text-muted-foreground">
                          {enc.encounterType}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          COMPLETED
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/doctor/consultation/${enc.id}`}
                          className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Encounter</span>
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
