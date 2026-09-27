'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Clock,
  PhoneCall,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  UserCheck,
  ChevronRight
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
  status: string;
  appointmentType: string;
  reason: string;
  notes?: string;
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
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  mrn: string;
  phone?: string;
  gender?: string;
}

export default function DoctorQueuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [patients, setPatients] = useState<Record<number, Patient>>({});
  const [calledPatientId, setCalledPatientId] = useState<number | null>(null);
  const [startingApptId, setStartingApptId] = useState<number | null>(null);
  const [activeQueueTab, setActiveQueueTab] = useState<'ALL' | 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED'>('WAITING');

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const meRes = await fetch('/api/proxy/api/v1/doctors/me');
      if (!meRes.ok) throw new Error('Doctor profile verification failed');
      const meData = await meRes.json();
      const doc = meData.data;
      setDoctor(doc);

      const apptRes = await fetch(`/api/proxy/api/v1/appointments/doctor/${doc.id}`);
      let apptList: Appointment[] = [];
      if (apptRes.ok) {
        apptList = (await apptRes.json()).data || [];
        setAppointments(apptList);
      }

      const encRes = await fetch(`/api/proxy/api/v1/encounters/doctor/${doc.id}`);
      let encList: Encounter[] = [];
      if (encRes.ok) {
        encList = (await encRes.json()).data || [];
        setEncounters(encList);
      }

      const pIds = Array.from(new Set([...apptList.map((a) => a.patientId), ...encList.map((e) => e.patientId)]));
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
      setPatients(pMap);
    } catch (err: any) {
      setError(err.message || 'Failed to load live queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a) => a.appointmentDate?.split('T')[0] === todayStr);

  // Group into queue stages
  const waitingList = todayAppts.filter(
    (a) =>
      (a.status === 'CONFIRMED' || a.status === 'WAITING' || a.status === 'SCHEDULED') &&
      !encounters.some((e) => e.appointmentId === a.id && e.status === 'IN_PROGRESS') &&
      !encounters.some((e) => e.appointmentId === a.id && e.status === 'COMPLETED')
  );

  const inConsultList = encounters.filter((e) => e.status === 'IN_PROGRESS');

  const completedList = encounters.filter((e) => e.status === 'COMPLETED');

  const handleCallPatient = (patientId: number, patientName: string) => {
    setCalledPatientId(patientId);
    setTimeout(() => setCalledPatientId(null), 3000);
  };

  const handleStartConsultation = async (appt: Appointment) => {
    if (!doctor) return;
    setStartingApptId(appt.id);
    try {
      const existing = encounters.find((e) => e.appointmentId === appt.id);
      if (existing) {
        router.push(`/doctor/consultation/${existing.id}`);
        return;
      }

      const res = await fetch('/api/proxy/api/v1/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: appt.patientId,
          hospitalId: appt.hospitalId || 101,
          departmentId: appt.departmentId || 101,
          doctorId: doctor.id,
          encounterType: appt.appointmentType === 'FOLLOW_UP' ? 'FOLLOW_UP' : 'OPD',
          appointmentId: appt.id,
          source: 'SCHEDULED',
          chiefComplaint: appt.reason || 'OPD Consultation',
          notes: appt.notes || '',
        }),
      });

      if (!res.ok) throw new Error('Encounter creation failed');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Today's Patient Queue
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time patient flow management for your clinic today ({todayStr}).
          </p>
        </div>
        <button
          onClick={fetchQueue}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 text-teal-600" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Queue Stage Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveQueueTab('WAITING')}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            activeQueueTab === 'WAITING'
              ? 'border-amber-500 bg-amber-50/50 shadow-sm dark:bg-amber-950/20'
              : 'border-border bg-card hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              1. WAITING TO BE CALLED
            </span>
            <Users className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{waitingList.length}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Checked-in & awaiting consultation</p>
        </div>

        <div
          onClick={() => setActiveQueueTab('IN_CONSULTATION')}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            activeQueueTab === 'IN_CONSULTATION'
              ? 'border-blue-500 bg-blue-50/50 shadow-sm dark:bg-blue-950/20'
              : 'border-border bg-card hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              2. IN CONSULTATION
            </span>
            <Stethoscope className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{inConsultList.length}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Currently inside clinical workspace</p>
        </div>

        <div
          onClick={() => setActiveQueueTab('COMPLETED')}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            activeQueueTab === 'COMPLETED'
              ? 'border-emerald-500 bg-emerald-50/50 shadow-sm dark:bg-emerald-950/20'
              : 'border-border bg-card hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              3. COMPLETED TODAY
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{completedList.length}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Finished sessions with clinical notes</p>
        </div>
      </div>

      {/* Called Notification Banner */}
      {calledPatientId && (
        <div className="rounded-lg bg-teal-600 text-white px-4 py-2.5 text-xs font-medium flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-4 w-4 animate-bounce" />
            <span>
              Now calling patient{' '}
              <strong>
                {patients[calledPatientId]?.firstName} {patients[calledPatientId]?.lastName} (MRN: {patients[calledPatientId]?.mrn})
              </strong>{' '}
              to consultation room.
            </span>
          </div>
          <span className="text-[11px] opacity-80">Announcement broadcasted</span>
        </div>
      )}

      {/* Queue View Content */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="border-b border-border px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">
              {activeQueueTab === 'WAITING' && 'Waiting Patients Queue'}
              {activeQueueTab === 'IN_CONSULTATION' && 'Active Consultations'}
              {activeQueueTab === 'COMPLETED' && 'Completed Consultations'}
              {activeQueueTab === 'ALL' && 'All Registered Queue'}
            </h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {activeQueueTab === 'WAITING' && waitingList.length}
              {activeQueueTab === 'IN_CONSULTATION' && inConsultList.length}
              {activeQueueTab === 'COMPLETED' && completedList.length}
            </span>
          </div>
        </div>

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
        ) : activeQueueTab === 'WAITING' ? (
          waitingList.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-teal-600 mb-2" />
              <h4 className="text-sm font-bold text-foreground">Queue is Clear</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                No patients are currently waiting in the clinic lobby.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {waitingList.map((appt, idx) => {
                const p = patients[appt.patientId];
                return (
                  <div
                    key={appt.id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-bold text-sm dark:bg-amber-950/60 dark:text-amber-300">
                        #{idx + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/doctor/patients/${appt.patientId}`}
                            className="font-bold text-foreground hover:text-teal-600 hover:underline"
                          >
                            {p ? `${p.firstName} ${p.lastName}` : `Patient #${appt.patientId}`}
                          </Link>
                          <span className="text-xs font-mono text-muted-foreground">
                            MRN: {p?.mrn || 'N/A'}
                          </span>
                          <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                            WAITING
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Scheduled: <span className="font-semibold text-foreground">{appt.startTime || '09:00'}</span> • Appt: <span className="font-mono">{appt.appointmentNumber}</span> • Reason: {appt.reason || 'General'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <button
                        onClick={() => handleCallPatient(appt.patientId, `${p?.firstName} ${p?.lastName}`)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
                      >
                        <PhoneCall className="h-3.5 w-3.5 text-amber-600" />
                        <span>Call Patient</span>
                      </button>

                      <button
                        onClick={() => handleStartConsultation(appt)}
                        disabled={startingApptId === appt.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-2xs disabled:opacity-60"
                      >
                        <Stethoscope className="h-3.5 w-3.5" />
                        <span>{startingApptId === appt.id ? 'Opening...' : 'Start Consult'}</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : activeQueueTab === 'IN_CONSULTATION' ? (
          inConsultList.length === 0 ? (
            <div className="p-12 text-center">
              <Stethoscope className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
              <h4 className="text-sm font-semibold text-foreground">No Active Consultation</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select a waiting patient to begin a consultation.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {inConsultList.map((enc) => {
                const p = patients[enc.patientId];
                return (
                  <div
                    key={enc.id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-blue-50/20 dark:bg-blue-950/10"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold dark:bg-blue-950/60 dark:text-blue-300">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">
                            {p ? `${p.firstName} ${p.lastName}` : `Patient #${enc.patientId}`}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">
                            MRN: {p?.mrn || 'N/A'}
                          </span>
                          <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                            IN PROGRESS
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Encounter: <span className="font-mono">{enc.encounterNumber}</span> • Chief Complaint: {enc.chiefComplaint || 'Consultation in progress'}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/doctor/consultation/${enc.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-2xs self-end md:self-auto"
                    >
                      <Stethoscope className="h-4 w-4" />
                      <span>Resume Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          completedList.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
              <h4 className="text-sm font-semibold text-foreground">No Completed Visits Yet</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Completed patient encounters will appear here once finalized.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {completedList.map((enc) => {
                const p = patients[enc.patientId];
                return (
                  <div
                    key={enc.id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {p ? `${p.firstName} ${p.lastName}` : `Patient #${enc.patientId}`}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          MRN: {p?.mrn || 'N/A'}
                        </span>
                        <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                          COMPLETED
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Encounter: <span className="font-mono">{enc.encounterNumber}</span> • Complaint: {enc.chiefComplaint || 'Consultation'}
                      </p>
                    </div>

                    <Link
                      href={`/doctor/consultation/${enc.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs self-end md:self-auto"
                    >
                      <span>View Record</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
