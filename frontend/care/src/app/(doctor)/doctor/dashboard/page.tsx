'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Stethoscope,
  Activity,
  Hospital,
  RefreshCw,
  Search,
  Eye,
  FileText
} from 'lucide-react';

interface DoctorProfile {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

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
  status: string;
  appointmentType: string;
  reason: string;
  notes?: string;
  patientName?: string;
  patientMrn?: string;
}

interface Encounter {
  id: number;
  encounterNumber: string;
  patientId: number;
  doctorId: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  appointmentId?: number;
  chiefComplaint?: string;
  startedAt?: string;
  endedAt?: string;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [patientsMap, setPatientsMap] = useState<Record<number, { name: string; mrn: string; gender?: string; age?: number }>>({});
  const [startingConsultationId, setStartingConsultationId] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch current doctor
      const meRes = await fetch('/api/proxy/api/v1/doctors/me');
      if (!meRes.ok) {
        throw new Error(`Failed to load doctor profile (${meRes.status})`);
      }
      const meJson = await meRes.json();
      const doc = meJson.data;
      setDoctor(doc);

      if (!doc || !doc.id) {
        throw new Error('Doctor identity could not be verified');
      }

      // 2. Fetch doctor appointments
      const apptRes = await fetch(`/api/proxy/api/v1/appointments/doctor/${doc.id}`);
      let apptList: Appointment[] = [];
      if (apptRes.ok) {
        const apptJson = await apptRes.json();
        apptList = apptJson.data || [];
        setAppointments(apptList);
      }

      // 3. Fetch doctor encounters
      const encRes = await fetch(`/api/proxy/api/v1/encounters/doctor/${doc.id}`);
      let encList: Encounter[] = [];
      if (encRes.ok) {
        const encJson = await encRes.json();
        encList = encJson.data || [];
        setEncounters(encList);
      }

      // 4. Batch fetch patient names for unique patientIds
      const uniquePatientIds = Array.from(
        new Set([...apptList.map((a) => a.patientId), ...encList.map((e) => e.patientId)])
      );

      const patientDetails: Record<number, { name: string; mrn: string; gender?: string; age?: number }> = {};
      await Promise.all(
        uniquePatientIds.map(async (pId) => {
          try {
            const pRes = await fetch(`/api/proxy/api/v1/patients/${pId}`);
            if (pRes.ok) {
              const pData = (await pRes.json()).data;
              if (pData) {
                patientDetails[pId] = {
                  name: `${pData.firstName || ''} ${pData.lastName || ''}`.trim() || `Patient #${pId}`,
                  mrn: pData.mrn || 'N/A',
                  gender: pData.gender,
                };
              }
            }
          } catch {
            // Patient detail failure fallback
          }
        })
      );
      setPatientsMap(patientDetails);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter today's appointments
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(
    (a) => a.appointmentDate === todayStr || a.appointmentDate.startsWith(todayStr)
  );

  // KPIs
  const totalToday = todayAppointments.length;
  const waitingPatients = todayAppointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'WAITING').length;
  const inConsultation = encounters.filter((e) => e.status === 'IN_PROGRESS').length;
  const completedToday = encounters.filter((e) => e.status === 'COMPLETED').length;
  const pendingConsultations = waitingPatients;

  // Next patient in line
  const nextAppointment = todayAppointments.find(
    (a) => a.status === 'CONFIRMED' || a.status === 'WAITING' || a.status === 'SCHEDULED'
  );

  // Start or open consultation
  const handleStartConsultation = async (appointment: Appointment) => {
    if (!doctor) return;
    setStartingConsultationId(appointment.id);
    try {
      // Check if encounter already exists for this appointment
      const existingEnc = encounters.find((e) => e.appointmentId === appointment.id);
      if (existingEnc) {
        router.push(`/doctor/consultation/${existingEnc.id}`);
        return;
      }

      // Create new encounter
      const createRes = await fetch('/api/proxy/api/v1/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: appointment.patientId,
          hospitalId: appointment.hospitalId || 101,
          departmentId: appointment.departmentId || 101,
          doctorId: doctor.id,
          encounterType: appointment.appointmentType === 'FOLLOW_UP' ? 'FOLLOW_UP' : 'OPD',
          appointmentId: appointment.id,
          source: 'SCHEDULED',
          chiefComplaint: appointment.reason || 'Routine Consultation',
          notes: appointment.notes || '',
        }),
      });

      if (!createRes.ok) {
        throw new Error('Failed to create clinical encounter');
      }

      const createData = await createRes.json();
      const encounterId = createData.data.id;

      // Start encounter
      await fetch(`/api/proxy/api/v1/encounters/${encounterId}/start`, {
        method: 'PATCH',
      });

      router.push(`/doctor/consultation/${encounterId}`);
    } catch (err: any) {
      alert(`Could not start consultation: ${err.message}`);
    } finally {
      setStartingConsultationId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-9 w-24 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl border border-border bg-card p-5 animate-pulse" />
          ))}
        </div>
        <div className="h-44 rounded-xl border border-border bg-card animate-pulse" />
        <div className="h-64 rounded-xl border border-border bg-card animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/60 p-8 text-center dark:border-red-900/60 dark:bg-red-950/20">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
        <h2 className="text-lg font-bold text-red-900 dark:text-red-200 mb-1">
          Unable to Load Clinical Dashboard
        </h2>
        <p className="text-sm text-red-700 dark:text-red-400 mb-6">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Clinical Workspace
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, Dr. {doctor?.firstName} {doctor?.lastName}. Here is your patient queue and schedule for today.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 text-teal-600" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Appointments */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today's Schedule
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <Calendar className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">{totalToday}</span>
            <span className="text-xs text-muted-foreground">patients booked</span>
          </div>
        </div>

        {/* Card 2: Waiting Patients */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Waiting in Queue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {waitingPatients}
            </span>
            <span className="text-xs text-muted-foreground">ready for consult</span>
          </div>
        </div>

        {/* Card 3: In Consultation */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              In Consultation
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Stethoscope className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              {inConsultation}
            </span>
            <span className="text-xs text-muted-foreground">active session</span>
          </div>
        </div>

        {/* Card 4: Completed Today */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Completed Today
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {completedToday}
            </span>
            <span className="text-xs text-muted-foreground">encounters done</span>
          </div>
        </div>
      </div>

      {/* Next Patient Action Banner */}
      {nextAppointment ? (
        <div className="rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 via-card to-card p-6 shadow-xs dark:border-teal-900/60 dark:from-teal-950/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-teal-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  NEXT PATIENT
                </span>
                <span className="text-xs font-semibold text-teal-800 dark:text-teal-300">
                  {nextAppointment.startTime || 'Scheduled'}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {nextAppointment.appointmentType}
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {patientsMap[nextAppointment.patientId]?.name || `Patient #${nextAppointment.patientId}`}
              </h2>
              <p className="text-xs text-muted-foreground">
                MRN: <span className="font-mono font-medium text-foreground">{patientsMap[nextAppointment.patientId]?.mrn || 'N/A'}</span> • Reason: {nextAppointment.reason || 'General checkup'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/doctor/patients/${nextAppointment.patientId}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                View History
              </Link>
              <button
                onClick={() => handleStartConsultation(nextAppointment)}
                disabled={startingConsultationId === nextAppointment.id}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-sm shadow-teal-600/20 disabled:opacity-60"
              >
                <Stethoscope className="h-4 w-4" />
                <span>
                  {startingConsultationId === nextAppointment.id
                    ? 'Opening Session...'
                    : 'Open Consultation'}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-teal-600 mb-2" />
          <h3 className="text-sm font-bold text-foreground">All Caught Up!</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            There are no waiting patients in your active queue right now.
          </p>
        </div>
      )}

      {/* Today's Schedule Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Today's Schedule</h3>
            <p className="text-xs text-muted-foreground">
              Chronological appointment queue for today ({todayAppointments.length} total)
            </p>
          </div>
          <Link
            href="/doctor/appointments"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center gap-1"
          >
            All Appointments <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
            <h4 className="text-sm font-semibold text-foreground">No Appointments Scheduled for Today</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              You do not have any patient consultations booked for today. You can check upcoming days in the Appointments tab.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Appt #</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {todayAppointments.map((appt) => {
                  const patient = patientsMap[appt.patientId];
                  const linkedEnc = encounters.find((e) => e.appointmentId === appt.id);

                  let statusBadge = (
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {appt.status}
                    </span>
                  );

                  if (appt.status === 'CONFIRMED') {
                    statusBadge = (
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                        WAITING
                      </span>
                    );
                  } else if (linkedEnc?.status === 'IN_PROGRESS') {
                    statusBadge = (
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                        IN CONSULTATION
                      </span>
                    );
                  } else if (linkedEnc?.status === 'COMPLETED' || appt.status === 'COMPLETED') {
                    statusBadge = (
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        COMPLETED
                      </span>
                    );
                  }

                  return (
                    <tr key={appt.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-foreground">
                        {appt.startTime || '09:00'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-foreground">
                          {patient?.name || `Patient #${appt.patientId}`}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          MRN: {patient?.mrn || 'N/A'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                        {appt.appointmentNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          {appt.appointmentType}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">{statusBadge}</td>
                      <td className="px-5 py-3.5 text-right">
                        {linkedEnc ? (
                          <Link
                            href={`/doctor/consultation/${linkedEnc.id}`}
                            className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 transition-colors"
                          >
                            <Stethoscope className="h-3.5 w-3.5" />
                            <span>{linkedEnc.status === 'COMPLETED' ? 'View Encounter' : 'Resume'}</span>
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleStartConsultation(appt)}
                            disabled={startingConsultationId === appt.id}
                            className="inline-flex items-center gap-1 rounded-md bg-teal-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-teal-700 transition-colors disabled:opacity-60 shadow-2xs"
                          >
                            <Stethoscope className="h-3.5 w-3.5" />
                            <span>{startingConsultationId === appt.id ? 'Starting...' : 'Start Consult'}</span>
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
    </div>
  );
}
