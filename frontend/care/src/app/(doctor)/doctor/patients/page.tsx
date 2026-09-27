'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  Eye,
  Calendar,
  FileText,
  UserCheck,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface PatientRecord {
  id: number;
  mrn: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  totalAppointments: number;
  totalEncounters: number;
  lastVisitDate?: string;
}

export default function DoctorPatientsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMyPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const meRes = await fetch('/api/proxy/api/v1/doctors/me');
      if (!meRes.ok) throw new Error('Failed to verify doctor identity');
      const doc = (await meRes.json()).data;

      // 1. Fetch appointments & encounters for this doctor
      const [apptRes, encRes] = await Promise.all([
        fetch(`/api/proxy/api/v1/appointments/doctor/${doc.id}`),
        fetch(`/api/proxy/api/v1/encounters/doctor/${doc.id}`),
      ]);

      const appts: any[] = apptRes.ok ? (await apptRes.json()).data || [] : [];
      const encs: any[] = encRes.ok ? (await encRes.json()).data || [] : [];

      // Only patients that have an established clinical relationship with this doctor
      const patientIdSet = new Set<number>([
        ...appts.map((a) => a.patientId),
        ...encs.map((e) => e.patientId),
      ]);

      const patientList: PatientRecord[] = [];

      await Promise.all(
        Array.from(patientIdSet).map(async (pid) => {
          try {
            const pRes = await fetch(`/api/proxy/api/v1/patients/${pid}`);
            if (pRes.ok) {
              const pData = (await pRes.json()).data;
              if (pData) {
                const patientAppts = appts.filter((a) => a.patientId === pid);
                const patientEncs = encs.filter((e) => e.patientId === pid);

                // Determine last visit
                const dates = [
                  ...patientAppts.map((a) => a.appointmentDate),
                  ...patientEncs.map((e) => e.createdAt?.split('T')[0]),
                ].filter(Boolean);
                dates.sort().reverse();

                patientList.push({
                  id: pid,
                  mrn: pData.mrn || 'N/A',
                  firstName: pData.firstName || '',
                  lastName: pData.lastName || '',
                  phone: pData.phone,
                  email: pData.email,
                  gender: pData.gender,
                  dateOfBirth: pData.dateOfBirth,
                  bloodGroup: pData.bloodGroup,
                  totalAppointments: patientAppts.length,
                  totalEncounters: patientEncs.length,
                  lastVisitDate: dates[0] || 'N/A',
                });
              }
            }
          } catch {
            // continue
          }
        })
      );

      // Sort by last visit descending
      patientList.sort((a, b) => (b.lastVisitDate || '').localeCompare(a.lastVisitDate || ''));
      setPatients(patientList);
    } catch (err: any) {
      setError(err.message || 'Failed to load doctor patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase().trim();
    return patients.filter((p) => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const mrn = p.mrn.toLowerCase();
      const phone = (p.phone || '').toLowerCase();
      return fullName.includes(q) || mrn.includes(q) || phone.includes(q);
    });
  }, [patients, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Clinical Patients
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Patients who have active appointments or historical encounters with your practice.
          </p>
        </div>
        <button
          onClick={fetchMyPatients}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 text-teal-600" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Scope Disclaimer Banner */}
      <div className="flex items-center gap-2.5 rounded-lg border border-teal-200/80 bg-teal-50/50 p-3 text-xs text-teal-900 dark:border-teal-900/60 dark:bg-teal-950/20 dark:text-teal-300">
        <UserCheck className="h-4 w-4 shrink-0 text-teal-600" />
        <span>
          <strong>Authorized Clinical Scope:</strong> You have clinical access strictly to patients who hold a validated appointment or encounter relationship with your identity.
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by patient name, MRN, phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </div>

      {/* Patients Table Card */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-muted/60 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No Patients Found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              No patient records matched your search query or relationship scope.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-5 py-3">MRN</th>
                  <th className="px-5 py-3">Patient Name</th>
                  <th className="px-5 py-3">Gender / DOB</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Visits</th>
                  <th className="px-5 py-3">Last Visit</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-foreground">
                      {p.mrn}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/doctor/patients/${p.id}`}
                        className="font-bold text-foreground hover:text-teal-600 hover:underline"
                      >
                        {p.firstName} {p.lastName}
                      </Link>
                      {p.bloodGroup && (
                        <span className="ml-2 inline-flex rounded bg-rose-50 px-1.5 py-0.2 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                          {p.bloodGroup}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {p.gender || 'Unknown'} {p.dateOfBirth && `• ${p.dateOfBirth}`}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {p.phone || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <span className="font-semibold text-foreground">{p.totalEncounters}</span> encounters • <span className="font-semibold text-foreground">{p.totalAppointments}</span> appts
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-foreground">
                      {p.lastVisitDate}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/doctor/patients/${p.id}`}
                        className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Details</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
