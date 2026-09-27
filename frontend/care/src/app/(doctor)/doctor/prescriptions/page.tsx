'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Pill,
  Search,
  RefreshCw,
  AlertCircle,
  Eye,
  FileText,
  Calendar,
  User
} from 'lucide-react';

interface PrescriptionItem {
  id: number;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route?: string;
  instructions?: string;
}

interface Prescription {
  id: number;
  prescriptionNumber: string;
  encounterId: number;
  doctorId: number;
  patientId: number;
  hospitalId: number;
  notes?: string;
  items: PrescriptionItem[];
  createdAt: string;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  mrn: string;
}

export default function DoctorPrescriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Record<number, Patient>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const meRes = await fetch('/api/proxy/api/v1/doctors/me');
      if (!meRes.ok) throw new Error('Doctor authentication failed');
      const doc = (await meRes.json()).data;

      // Fetch all encounters for this doctor
      const encRes = await fetch(`/api/proxy/api/v1/encounters/doctor/${doc.id}`);
      if (!encRes.ok) throw new Error('Failed to fetch doctor encounters');
      const encs = (await encRes.json()).data || [];

      // For each encounter, fetch prescriptions
      const rxList: Prescription[] = [];
      await Promise.all(
        encs.map(async (enc: any) => {
          try {
            const rxRes = await fetch(`/api/proxy/api/v1/encounters/${enc.id}/prescriptions`);
            if (rxRes.ok) {
              const rxData: Prescription[] = (await rxRes.json()).data || [];
              rxList.push(...rxData);
            }
          } catch {
            // continue
          }
        })
      );

      // Sort newest first
      rxList.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setPrescriptions(rxList);

      // Fetch patient details
      const pIds = Array.from(new Set(rxList.map((r) => r.patientId)));
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
      setError(err.message || 'Error loading prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return prescriptions;
    const q = searchQuery.toLowerCase().trim();
    return prescriptions.filter((rx) => {
      const p = patients[rx.patientId];
      const pName = `${p?.firstName || ''} ${p?.lastName || ''}`.toLowerCase();
      const mrn = (p?.mrn || '').toLowerCase();
      const rxNum = rx.prescriptionNumber.toLowerCase();
      const medNames = rx.items?.map((i) => i.medicineName.toLowerCase()).join(' ') || '';

      return pName.includes(q) || mrn.includes(q) || rxNum.includes(q) || medNames.includes(q);
    });
  }, [prescriptions, searchQuery, patients]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Prescriptions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Log of all pharmacotherapy and prescriptions issued across your clinical encounters.
          </p>
        </div>
        <button
          onClick={fetchPrescriptions}
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
          placeholder="Search by patient name, MRN, medicine, Rx #..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </div>

      {/* Prescriptions List */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted/60 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Pill className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No Prescriptions Found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              No prescriptions have been issued yet or match your search criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((rx) => {
              const p = patients[rx.patientId];
              return (
                <div key={rx.id} className="p-5 space-y-3 hover:bg-muted/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                        <Pill className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {rx.prescriptionNumber}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <Link
                            href={`/doctor/patients/${rx.patientId}`}
                            className="font-bold text-foreground hover:text-teal-600 hover:underline text-sm"
                          >
                            {p ? `${p.firstName} ${p.lastName}` : `Patient #${rx.patientId}`}
                          </Link>
                          <span className="font-mono text-xs text-muted-foreground">
                            ({p?.mrn || 'N/A'})
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          Prescribed {rx.createdAt?.split('T')[0]} • Encounter #{rx.encounterId}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/doctor/consultation/${rx.encounterId}`}
                      className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 self-start sm:self-auto"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Encounter</span>
                    </Link>
                  </div>

                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/40 font-semibold text-muted-foreground border-b border-border">
                        <tr>
                          <th className="px-3 py-2">Medicine</th>
                          <th className="px-3 py-2">Dosage</th>
                          <th className="px-3 py-2">Frequency</th>
                          <th className="px-3 py-2">Duration</th>
                          <th className="px-3 py-2">Route</th>
                          <th className="px-3 py-2">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {rx.items?.map((item) => (
                          <tr key={item.id}>
                            <td className="px-3 py-2 font-bold text-foreground">{item.medicineName}</td>
                            <td className="px-3 py-2">{item.dosage}</td>
                            <td className="px-3 py-2">{item.frequency}</td>
                            <td className="px-3 py-2">{item.duration}</td>
                            <td className="px-3 py-2">{item.route || 'Oral'}</td>
                            <td className="px-3 py-2 text-muted-foreground">{item.instructions || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {rx.notes && (
                    <p className="text-xs text-muted-foreground italic">
                      Doctor's Notes: {rx.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
