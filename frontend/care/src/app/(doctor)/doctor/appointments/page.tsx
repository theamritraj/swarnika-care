'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Stethoscope,
  Eye,
  User,
  Clock,
  ArrowUpDown
} from 'lucide-react';

interface Appointment {
  id: number;
  appointmentNumber: string;
  patientId: number;
  doctorId: number;
  hospitalId: number;
  departmentId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  appointmentType: string;
  bookingSource: string;
  reason: string;
  notes?: string;
  createdAt: string;
}

interface Encounter {
  id: number;
  appointmentId?: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  mrn: string;
  phone?: string;
  gender?: string;
}

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [patients, setPatients] = useState<Record<number, Patient>>({});
  const [activeFilter, setActiveFilter] = useState<'TODAY' | 'TOMORROW' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'ALL'>('TODAY');
  const [searchQuery, setSearchQuery] = useState('');
  const [startingApptId, setStartingApptId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const meRes = await fetch('/api/proxy/api/v1/doctors/me');
      if (!meRes.ok) throw new Error('Failed to authenticate doctor identity');
      const meJson = await meRes.json();
      const doctorId = meJson.data?.id;

      if (!doctorId) throw new Error('Doctor profile not found');

      // 1. Fetch appointments
      const apptRes = await fetch(`/api/proxy/api/v1/appointments/doctor/${doctorId}`);
      if (!apptRes.ok) throw new Error('Failed to load appointments from server');
      const apptJson = await apptRes.json();
      const appts: Appointment[] = apptJson.data || [];
      setAppointments(appts);

      // 2. Fetch encounters
      const encRes = await fetch(`/api/proxy/api/v1/encounters/doctor/${doctorId}`);
      if (encRes.ok) {
        const encJson = await encRes.json();
        setEncounters(encJson.data || []);
      }

      // 3. Batch fetch patient profiles
      const patientIds = Array.from(new Set(appts.map((a) => a.patientId)));
      const patientMap: Record<number, Patient> = {};

      await Promise.all(
        patientIds.map(async (pid) => {
          try {
            const pRes = await fetch(`/api/proxy/api/v1/patients/${pid}`);
            if (pRes.ok) {
              const pData = (await pRes.json()).data;
              if (pData) {
                patientMap[pid] = {
                  id: pid,
                  firstName: pData.firstName,
                  lastName: pData.lastName,
                  mrn: pData.mrn,
                  phone: pData.phone,
                  gender: pData.gender,
                };
              }
            }
          } catch {
            // continue
          }
        })
      );
      setPatients(patientMap);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      // 1. Tab filter
      const apptDate = appt.appointmentDate?.split('T')[0];
      if (activeFilter === 'TODAY' && apptDate !== todayStr) return false;
      if (activeFilter === 'TOMORROW' && apptDate !== tomorrowStr) return false;
      if (activeFilter === 'UPCOMING' && apptDate <= todayStr) return false;
      if (activeFilter === 'COMPLETED' && appt.status !== 'COMPLETED') return false;
      if (activeFilter === 'CANCELLED' && appt.status !== 'CANCELLED') return false;

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const p = patients[appt.patientId];
        const pName = `${p?.firstName || ''} ${p?.lastName || ''}`.toLowerCase();
        const mrn = (p?.mrn || '').toLowerCase();
        const apptNum = (appt.appointmentNumber || '').toLowerCase();

        return pName.includes(q) || mrn.includes(q) || apptNum.includes(q);
      }

      return true;
    });
  }, [appointments, activeFilter, searchQuery, patients, todayStr, tomorrowStr]);

  const handleStartConsultation = async (appt: Appointment) => {
    setStartingApptId(appt.id);
    try {
      const existingEnc = encounters.find((e) => e.appointmentId === appt.id);
      if (existingEnc) {
        router.push(`/doctor/consultation/${existingEnc.id}`);
        return;
      }

      const res = await fetch('/api/proxy/api/v1/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: appt.patientId,
          hospitalId: appt.hospitalId || 101,
          departmentId: appt.departmentId || 101,
          doctorId: appt.doctorId,
          encounterType: appt.appointmentType === 'FOLLOW_UP' ? 'FOLLOW_UP' : 'OPD',
          appointmentId: appt.id,
          source: 'SCHEDULED',
          chiefComplaint: appt.reason || 'General Consultation',
          notes: appt.notes || '',
        }),
      });

      if (!res.ok) throw new Error('Failed to initiate consultation encounter');
      const data = await res.json();
      const encounterId = data.data.id;

      await fetch(`/api/proxy/api/v1/encounters/${encounterId}/start`, { method: 'PATCH' });
      router.push(`/doctor/consultation/${encounterId}`);
    } catch (err: any) {
      alert(`Could not start consultation: ${err.message}`);
    } finally {
      setStartingApptId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Appointments
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your patient consultation schedule and active bookings.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 text-teal-600" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-card p-1">
          {(['TODAY', 'TOMORROW', 'UPCOMING', 'COMPLETED', 'CANCELLED', 'ALL'] as const).map((filter) => {
            const count = appointments.filter((a) => {
              const d = a.appointmentDate?.split('T')[0];
              if (filter === 'TODAY') return d === todayStr;
              if (filter === 'TOMORROW') return d === tomorrowStr;
              if (filter === 'UPCOMING') return d > todayStr;
              if (filter === 'COMPLETED') return a.status === 'COMPLETED';
              if (filter === 'CANCELLED') return a.status === 'CANCELLED';
              return true;
            }).length;

            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeFilter === filter
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>{filter.charAt(0) + filter.slice(1).toLowerCase()}</span>
                <span className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                  activeFilter === filter ? 'bg-teal-700 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search patient, MRN, appt #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted/60 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
            >
              Retry
            </button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No Appointments Found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              There are no appointments matching your current filter criteria ({activeFilter.toLowerCase()}).
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-5 py-3">Appt #</th>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Date & Time</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAppointments.map((appt) => {
                  const p = patients[appt.patientId];
                  const linkedEnc = encounters.find((e) => e.appointmentId === appt.id);

                  let statusBadge = (
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {appt.status}
                    </span>
                  );
                  if (appt.status === 'CONFIRMED') {
                    statusBadge = (
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                        CONFIRMED
                      </span>
                    );
                  } else if (appt.status === 'COMPLETED' || linkedEnc?.status === 'COMPLETED') {
                    statusBadge = (
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        COMPLETED
                      </span>
                    );
                  } else if (appt.status === 'CANCELLED') {
                    statusBadge = (
                      <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
                        CANCELLED
                      </span>
                    );
                  }

                  return (
                    <tr key={appt.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-foreground">
                        {appt.appointmentNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/doctor/patients/${appt.patientId}`}
                          className="font-semibold text-foreground hover:text-teal-600 hover:underline"
                        >
                          {p ? `${p.firstName} ${p.lastName}` : `Patient #${appt.patientId}`}
                        </Link>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          MRN: {p?.mrn || 'N/A'} {p?.gender && `• ${p.gender}`}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-xs font-medium text-foreground">{appt.appointmentDate}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">{appt.startTime || 'Scheduled'}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          {appt.appointmentType}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 max-w-xs truncate text-xs text-muted-foreground">
                        {appt.reason || 'None specified'}
                      </td>
                      <td className="px-5 py-3.5">{statusBadge}</td>
                      <td className="px-5 py-3.5 text-right">
                        {linkedEnc ? (
                          <Link
                            href={`/doctor/consultation/${linkedEnc.id}`}
                            className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>{linkedEnc.status === 'COMPLETED' ? 'View' : 'Resume'}</span>
                          </Link>
                        ) : appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' ? (
                          <button
                            onClick={() => handleStartConsultation(appt)}
                            disabled={startingApptId === appt.id}
                            className="inline-flex items-center gap-1 rounded-md bg-teal-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-teal-700 transition-colors disabled:opacity-60 shadow-2xs"
                          >
                            <Stethoscope className="h-3.5 w-3.5" />
                            <span>{startingApptId === appt.id ? 'Opening...' : 'Start'}</span>
                          </button>
                        ) : (
                          <Link
                            href={`/doctor/patients/${appt.patientId}`}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
                          >
                            <User className="h-3.5 w-3.5" />
                            <span>Patient</span>
                          </Link>
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
    </div>
  );
}
