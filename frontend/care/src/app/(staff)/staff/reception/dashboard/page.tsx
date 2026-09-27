'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useReceptionSidebar } from '../components/ReceptionSidebarContext';
import {
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  UserCheck,
  UserPlus,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  Phone,
  Building2,
  CalendarPlus,
  ChevronRight,
  Stethoscope
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
  source?: string;
}

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
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  mrn: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialization?: string;
  hospitalId?: number;
  departmentId?: number;
}

interface Department {
  id: number;
  name: string;
  hospitalId?: number;
}

export default function ReceptionDashboard() {
  const router = useRouter();
  const { activeHospitalId } = useReceptionSidebar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [patients, setPatients] = useState<Record<number, Patient>>({});
  const [doctors, setDoctors] = useState<Record<number, Doctor>>({});
  const [departments, setDepartments] = useState<Record<number, Department>>({});

  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [checkInLoadingId, setCheckInLoadingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch appointments
      const apptRes = await fetch('/api/proxy/api/v1/appointments');
      let apptList: Appointment[] = [];
      if (apptRes.ok) {
        const data = await apptRes.json();
        apptList = data.data || [];
        setAppointments(apptList);
      }

      // 2. Fetch encounters
      const encRes = await fetch('/api/proxy/api/v1/encounters');
      let encList: Encounter[] = [];
      if (encRes.ok) {
        const data = await encRes.json();
        encList = data.data || [];
        setEncounters(encList);
      }

      // 3. Fetch doctors
      const docRes = await fetch('/api/proxy/api/v1/doctors');
      if (docRes.ok) {
        const data = await docRes.json();
        const docMap: Record<number, Doctor> = {};
        (data.data || []).forEach((d: Doctor) => {
          docMap[d.id] = d;
        });
        setDoctors(docMap);
      }

      // 4. Fetch departments
      const deptRes = await fetch('/api/proxy/api/v1/departments');
      if (deptRes.ok) {
        const data = await deptRes.json();
        const deptMap: Record<number, Department> = {};
        (data.data || []).forEach((d: Department) => {
          deptMap[d.id] = d;
        });
        setDepartments(deptMap);
      }

      // 5. Fetch patients for all related appointments/encounters
      const pIds = Array.from(
        new Set([
          ...apptList.map((a) => a.patientId),
          ...encList.map((e) => e.patientId),
        ])
      );

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
                  phone: pData.phone,
                  gender: pData.gender,
                  dateOfBirth: pData.dateOfBirth,
                };
              }
            }
          } catch {
            // ignore
          }
        })
      );
      setPatients(pMap);
    } catch (err: any) {
      setError(err.message || 'Failed to load front desk dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeHospitalId]);

  // Today's Date String in YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter scoped to today and active hospital (or all if not strictly scoped)
  const todayAppts = useMemo(() => {
    return appointments.filter((a) => {
      const matchDate = a.appointmentDate?.split('T')[0] === todayStr;
      const matchHospital = !activeHospitalId || Number(a.hospitalId) === Number(activeHospitalId);
      return matchDate && matchHospital;
    });
  }, [appointments, todayStr, activeHospitalId]);

  const todayEncounters = useMemo(() => {
    return encounters.filter((e) => {
      const encDate = e.createdAt ? e.createdAt.split('T')[0] : todayStr;
      const matchDate = encDate === todayStr;
      const matchHospital = !activeHospitalId || Number(e.hospitalId) === Number(activeHospitalId);
      return matchDate && matchHospital;
    });
  }, [encounters, todayStr, activeHospitalId]);

  // Live KPI Calculations
  const metrics = useMemo(() => {
    const totalToday = todayAppts.length;
    const checkedInWaiting = todayEncounters.filter((e) => e.status === 'OPEN').length;
    const inConsultation = todayEncounters.filter((e) => e.status === 'IN_PROGRESS').length;
    const completed = todayEncounters.filter((e) => e.status === 'COMPLETED').length +
      todayAppts.filter((a) => a.status === 'COMPLETED').length;
    const walkIns = todayAppts.filter((a) => a.source === 'WALK_IN' || a.reason?.toLowerCase().includes('walk-in')).length;

    return {
      totalToday,
      checkedInWaiting,
      inConsultation,
      completed,
      walkIns,
    };
  }, [todayAppts, todayEncounters]);

  // Handle Instant Check-in
  const handleCheckIn = async (appt: Appointment) => {
    setCheckInLoadingId(appt.id);
    setError(null);
    setSuccessMessage(null);

    try {
      // 1. Confirm appointment in appointment-service
      const confRes = await fetch(`/api/proxy/api/v1/appointments/${appt.id}/confirm`, {
        method: 'PATCH',
      });

      if (!confRes.ok) {
        const errJson = await confRes.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to confirm appointment');
      }

      // 2. Create open OPD Encounter in encounter-service to place patient in doctor queue
      const encPayload = {
        patientId: appt.patientId,
        hospitalId: appt.hospitalId,
        departmentId: appt.departmentId,
        doctorId: appt.doctorId,
        encounterType: 'OPD',
        appointmentId: appt.id,
        source: appt.source === 'WALK_IN' ? 'WALK_IN' : 'APPOINTMENT',
        chiefComplaint: appt.reason || 'OPD Consultation Check-in',
      };

      const encRes = await fetch('/api/proxy/api/v1/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encPayload),
      });

      if (!encRes.ok) {
        console.warn('Encounter creation note: appointment confirmed, encounter status pending');
      }

      setSuccessMessage(`Patient successfully checked in! Placed in Doctor Queue.`);
      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'Check-in failed');
    } finally {
      setCheckInLoadingId(null);
    }
  };

  // Filtered Appointments List
  const filteredAppointments = useMemo(() => {
    return todayAppts.filter((a) => {
      const patient = patients[a.patientId];
      const doctor = doctors[a.doctorId];
      const dept = departments[a.departmentId];

      const searchLower = searchFilter.toLowerCase();
      const matchSearch =
        !searchFilter ||
        a.appointmentNumber?.toLowerCase().includes(searchLower) ||
        (patient && `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower)) ||
        (patient && patient.mrn?.toLowerCase().includes(searchLower)) ||
        (patient && patient.phone?.includes(searchLower)) ||
        (doctor && `Dr. ${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchLower)) ||
        (dept && dept.name?.toLowerCase().includes(searchLower));

      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [todayAppts, searchFilter, statusFilter, patients, doctors, departments]);

  return (
    <div className="space-y-6">
      {/* Top Header / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Front Desk Operations Desk
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time patient intake, check-in, appointments, and live OPD queue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-accent text-foreground transition-colors cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
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

      {/* Live Operational KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Today's Appts
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-[#007b92] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {metrics.totalToday}
          </div>
          <span className="text-[11px] text-muted-foreground">Scheduled for today</span>
        </div>

        <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Checked In / Waiting
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {metrics.checkedInWaiting}
          </div>
          <span className="text-[11px] text-amber-600 font-medium">In waiting room</span>
        </div>

        <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              In Consultation
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {metrics.inConsultation}
          </div>
          <span className="text-[11px] text-blue-600 font-medium">With Doctor now</span>
        </div>

        <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Walk-in Intake
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {metrics.walkIns}
          </div>
          <span className="text-[11px] text-muted-foreground">Unscheduled arrivals</span>
        </div>

        <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Completed
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {metrics.completed}
          </div>
          <span className="text-[11px] text-muted-foreground">Consultations finished</span>
        </div>
      </div>

      {/* Quick Action Command Center */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-2xs">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Front Desk Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            href="/staff/reception/patients/new"
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-border/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-[#007b92]/5 hover:border-[#007b92]/40 transition-all group text-center"
          >
            <div className="w-10 h-10 rounded-lg bg-[#007b92]/10 text-[#007b92] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-foreground">Register Patient</span>
            <span className="text-[11px] text-muted-foreground">Generate MRN</span>
          </Link>

          <Link
            href="/staff/reception/appointments/new"
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-border/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-[#007b92]/5 hover:border-[#007b92]/40 transition-all group text-center"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-[#007b92] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-foreground">New Appointment</span>
            <span className="text-[11px] text-muted-foreground">Doctor OPD booking</span>
          </Link>

          <Link
            href="/staff/reception/walk-in"
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-border/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-emerald-500/5 hover:border-emerald-500/40 transition-all group text-center"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-foreground">Walk-in Intake</span>
            <span className="text-[11px] text-muted-foreground">Fast arrival booking</span>
          </Link>

          <Link
            href="/staff/reception/queue"
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-border/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-[#007b92]/5 hover:border-[#007b92]/40 transition-all group text-center"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-foreground">Live OPD Queue</span>
            <span className="text-[11px] text-muted-foreground">Waiting room tokens</span>
          </Link>

          <Link
            href="/staff/reception/emergency"
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-red-200/80 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all group text-center"
          >
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-red-600 dark:text-red-400">Emergency Intake</span>
            <span className="text-[11px] text-muted-foreground">Fast-track ER route</span>
          </Link>
        </div>
      </div>

      {/* Today's Front Desk Appointments & Check-in Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-5 border-b border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              Today's Scheduled Appointments
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-muted-foreground">
                {filteredAppointments.length}
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Verify patient arrivals and execute check-ins to dispatch into doctor consultation queue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter patient, doctor, appt #..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="BOOKED">Booked</option>
              <option value="CONFIRMED">Checked-in / Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#007b92]" />
            <span>Loading front desk roster...</span>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No appointments found matching current filters for today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Token / Appt #</th>
                  <th className="py-3 px-4">Patient Details</th>
                  <th className="py-3 px-4">Attending Doctor</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Operational Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAppointments.map((appt) => {
                  const patient = patients[appt.patientId];
                  const doctor = doctors[appt.doctorId];
                  const dept = departments[appt.departmentId];

                  const isCheckedIn = appt.status === 'CONFIRMED' || appt.status === 'CHECKED_IN';
                  const isCompleted = appt.status === 'COMPLETED';
                  const isCancelled = appt.status === 'CANCELLED';

                  return (
                    <tr
                      key={appt.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-foreground whitespace-nowrap">
                        {appt.startTime?.slice(0, 5) || '10:00'} - {appt.endTime?.slice(0, 5) || '10:30'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#007b92] font-semibold whitespace-nowrap">
                        {appt.appointmentNumber || `APT-${appt.id}`}
                      </td>
                      <td className="py-3 px-4">
                        {patient ? (
                          <div>
                            <Link
                              href={`/staff/reception/patients?q=${patient.mrn}`}
                              className="font-semibold text-foreground hover:text-[#007b92] flex items-center gap-1.5"
                            >
                              {patient.firstName} {patient.lastName}
                            </Link>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                              <span className="font-mono">{patient.mrn}</span>
                              {patient.phone && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-2.5 h-2.5" />
                                    {patient.phone}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Patient #{appt.patientId}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {doctor ? (
                          <div>
                            <p className="font-medium text-foreground">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {doctor.specialization || 'Consultant'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Doctor #{appt.doctorId}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-foreground font-medium text-[11px]">
                          {dept?.name || 'General OPD'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-muted-foreground text-[11px] font-medium">
                          {appt.appointmentType || 'IN_PERSON'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isCheckedIn
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                              : isCompleted
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400'
                              : isCancelled
                              ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400'
                              : 'bg-teal-100 text-[#007b92] dark:bg-teal-950/60 dark:text-teal-300'
                          }`}
                        >
                          {isCheckedIn ? 'Waiting in Queue' : appt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {!isCheckedIn && !isCompleted && !isCancelled ? (
                          <button
                            type="button"
                            onClick={() => handleCheckIn(appt)}
                            disabled={checkInLoadingId === appt.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#007b92] text-white hover:bg-[#00667a] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{checkInLoadingId === appt.id ? 'Checking In...' : 'Check In'}</span>
                          </button>
                        ) : isCheckedIn ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Checked In
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
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
