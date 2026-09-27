'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useReceptionSidebar } from '../components/ReceptionSidebarContext';
import {
  Calendar,
  Search,
  Filter,
  UserCheck,
  CalendarPlus,
  RefreshCw,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  CalendarDays,
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
  source?: string;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  mrn: string;
  phone?: string;
  gender?: string;
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
}

export default function ReceptionAppointmentsPage() {
  const { activeHospitalId } = useReceptionSidebar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Record<number, Patient>>({});
  const [doctors, setDoctors] = useState<Record<number, Doctor>>({});
  const [departments, setDepartments] = useState<Record<number, Department>>({});

  // Filters
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [doctorFilter, setDoctorFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Check-in state
  const [checkingInId, setCheckingInId] = useState<number | null>(null);

  // Reschedule Modal
  const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleStartTime, setRescheduleStartTime] = useState<string>('10:00:00');
  const [rescheduleEndTime, setRescheduleEndTime] = useState<string>('10:30:00');
  const [rescheduleReason, setRescheduleReason] = useState<string>('');
  const [savingReschedule, setSavingReschedule] = useState<boolean>(false);

  // Cancel Modal
  const [cancelAppt, setCancelAppt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [savingCancel, setSavingCancel] = useState<boolean>(false);

  // Fetch all initial data
  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const [apptRes, docRes, deptRes] = await Promise.all([
        fetch('/api/proxy/api/v1/appointments'),
        fetch('/api/proxy/api/v1/doctors'),
        fetch('/api/proxy/api/v1/departments'),
      ]);

      let apptList: Appointment[] = [];
      if (apptRes.ok) {
        const aData = await apptRes.json();
        apptList = aData.data || [];
        setAppointments(apptList);
      }

      if (docRes.ok) {
        const dData = await docRes.json();
        const dMap: Record<number, Doctor> = {};
        (dData.data || []).forEach((d: Doctor) => {
          dMap[d.id] = d;
        });
        setDoctors(dMap);
      }

      if (deptRes.ok) {
        const depData = await deptRes.json();
        const depMap: Record<number, Department> = {};
        (depData.data || []).forEach((d: Department) => {
          depMap[d.id] = d;
        });
        setDepartments(depMap);
      }

      // Fetch patient profiles
      const pIds = Array.from(new Set(apptList.map((a) => a.patientId)));
      const pMap: Record<number, Patient> = {};
      await Promise.all(
        pIds.slice(0, 60).map(async (pid) => {
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
      setError(err.message || 'Failed to load appointments roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [activeHospitalId]);

  // Execute Check-in
  const handleCheckIn = async (appt: Appointment) => {
    setCheckingInId(appt.id);
    setError(null);
    setSuccessMessage(null);
    try {
      // 1. Confirm appointment
      const confRes = await fetch(`/api/proxy/api/v1/appointments/${appt.id}/confirm`, {
        method: 'PATCH',
      });
      if (!confRes.ok) {
        const errJson = await confRes.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to confirm appointment');
      }

      // 2. Create open OPD Encounter
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

      await fetch('/api/proxy/api/v1/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encPayload),
      });

      setSuccessMessage(`Patient checked in successfully! Placed in Doctor Queue.`);
      await loadAppointments();
    } catch (err: any) {
      setError(err.message || 'Check-in failed');
    } finally {
      setCheckingInId(null);
    }
  };

  // Open Reschedule Modal
  const openRescheduleModal = (appt: Appointment) => {
    setRescheduleAppt(appt);
    setRescheduleDate(appt.appointmentDate?.split('T')[0] || todayStr);
    setRescheduleStartTime(appt.startTime || '10:00:00');
    setRescheduleEndTime(appt.endTime || '10:30:00');
    setRescheduleReason('');
  };

  // Submit Reschedule
  const handleSaveReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleAppt) return;
    setSavingReschedule(true);
    setError(null);

    try {
      const payload = {
        newAppointmentDate: rescheduleDate,
        newStartTime: rescheduleStartTime.length === 5 ? `${rescheduleStartTime}:00` : rescheduleStartTime,
        newEndTime: rescheduleEndTime.length === 5 ? `${rescheduleEndTime}:00` : rescheduleEndTime,
        reason: rescheduleReason.trim() || 'Patient requested reschedule',
      };

      const res = await fetch(`/api/proxy/api/v1/appointments/${rescheduleAppt.id}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to reschedule appointment');
      }

      setSuccessMessage('Appointment rescheduled successfully!');
      setRescheduleAppt(null);
      await loadAppointments();
    } catch (err: any) {
      setError(err.message || 'Reschedule failed');
    } finally {
      setSavingReschedule(false);
    }
  };

  // Open Cancel Modal
  const openCancelModal = (appt: Appointment) => {
    setCancelAppt(appt);
    setCancelReason('');
  };

  // Submit Cancellation
  const handleSaveCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelAppt) return;
    setSavingCancel(true);
    setError(null);

    try {
      const payload = {
        reason: cancelReason.trim() || 'Administrative cancellation',
      };

      const res = await fetch(`/api/proxy/api/v1/appointments/${cancelAppt.id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to cancel appointment');
      }

      setSuccessMessage('Appointment cancelled successfully.');
      setCancelAppt(null);
      await loadAppointments();
    } catch (err: any) {
      setError(err.message || 'Cancellation failed');
    } finally {
      setSavingCancel(false);
    }
  };

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      // 1. Hospital Scope
      if (activeHospitalId && Number(a.hospitalId) !== Number(activeHospitalId)) {
        return false;
      }

      // 2. Date
      if (selectedDate && a.appointmentDate?.split('T')[0] !== selectedDate) {
        return false;
      }

      // 3. Doctor
      if (doctorFilter !== 'ALL' && Number(a.doctorId) !== Number(doctorFilter)) {
        return false;
      }

      // 4. Department
      if (departmentFilter !== 'ALL' && Number(a.departmentId) !== Number(departmentFilter)) {
        return false;
      }

      // 5. Status
      if (statusFilter !== 'ALL' && a.status !== statusFilter) {
        return false;
      }

      // 6. Search
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase().trim();
        const patient = patients[a.patientId];
        const doctor = doctors[a.doctorId];
        const apptNumMatch = a.appointmentNumber?.toLowerCase().includes(q);
        const pNameMatch = patient && `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(q);
        const pMrnMatch = patient && patient.mrn?.toLowerCase().includes(q);
        const pPhoneMatch = patient && patient.phone?.includes(q);
        const docNameMatch = doctor && `Dr. ${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(q);

        if (!apptNumMatch && !pNameMatch && !pMrnMatch && !pPhoneMatch && !docNameMatch) {
          return false;
        }
      }

      return true;
    });
  }, [
    appointments,
    activeHospitalId,
    selectedDate,
    doctorFilter,
    departmentFilter,
    statusFilter,
    searchFilter,
    patients,
    doctors,
  ]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Front Desk Appointment Operations
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage daily schedules, verify arrivals, check-in patients, and handle reschedules or cancellations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/staff/reception/appointments/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#007b92] text-white hover:bg-[#00667a] shadow-2xs transition-colors"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Book Appointment</span>
          </Link>
          <button
            type="button"
            onClick={loadAppointments}
            disabled={loading}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg border border-border transition-colors cursor-pointer"
            title="Refresh Schedule"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
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

      {/* Filters Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Date Picker */}
          <div>
            <label className="block text-muted-foreground font-semibold mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
            />
          </div>

          {/* Doctor Filter */}
          <div>
            <label className="block text-muted-foreground font-semibold mb-1">Doctor</label>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="ALL">All Doctors</option>
              {Object.values(doctors).map((doc) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.firstName} {doc.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-muted-foreground font-semibold mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="ALL">All Departments</option>
              {Object.values(departments).map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-muted-foreground font-semibold mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="ALL">All Statuses</option>
              <option value="BOOKED">Booked</option>
              <option value="CONFIRMED">Confirmed / Checked-in</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-muted-foreground font-semibold mb-1">Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Patient, MRN, phone..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#007b92]" />
            <h2 className="text-sm font-bold text-foreground">
              Appointments List ({filteredAppointments.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedDate(todayStr);
              setDoctorFilter('ALL');
              setDepartmentFilter('ALL');
              setStatusFilter('ALL');
              setSearchFilter('');
            }}
            className="text-xs text-[#007b92] hover:underline font-semibold"
          >
            Reset Filters
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#007b92]" />
            <span>Loading appointments...</span>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No appointments found for the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Appt #</th>
                  <th className="py-3 px-4">Patient Information</th>
                  <th className="py-3 px-4">Doctor & Dept</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
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
                            <span className="font-semibold text-foreground">
                              {patient.firstName} {patient.lastName}
                            </span>
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
                              {dept?.name || doctor.specialization || 'OPD'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Doctor #{appt.doctorId}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-muted-foreground text-[11px]">
                          {appt.appointmentType}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-muted-foreground">
                        {appt.reason || 'General checkup'}
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
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Check-in action */}
                          {!isCheckedIn && !isCompleted && !isCancelled && (
                            <button
                              type="button"
                              onClick={() => handleCheckIn(appt)}
                              disabled={checkingInId === appt.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-[#007b92] text-white hover:bg-[#00667a] transition-colors"
                              title="Check in patient"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>{checkingInId === appt.id ? '...' : 'Check In'}</span>
                            </button>
                          )}

                          {/* Reschedule action */}
                          {!isCompleted && !isCancelled && (
                            <button
                              type="button"
                              onClick={() => openRescheduleModal(appt)}
                              className="px-2 py-1 text-xs font-semibold rounded-md border border-border hover:bg-accent text-foreground transition-colors"
                              title="Reschedule appointment"
                            >
                              Reschedule
                            </button>
                          )}

                          {/* Cancel action */}
                          {!isCompleted && !isCancelled && (
                            <button
                              type="button"
                              onClick={() => openCancelModal(appt)}
                              className="px-2 py-1 text-xs font-semibold rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Cancel appointment"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleAppt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setRescheduleAppt(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-foreground mb-1">
              Reschedule Appointment
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {rescheduleAppt.appointmentNumber} — Select new date and time slot.
            </p>

            <form onSubmit={handleSaveReschedule} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-muted-foreground font-medium mb-1">
                  New Appointment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleStartTime}
                    onChange={(e) => setRescheduleStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleEndTime}
                    onChange={(e) => setRescheduleEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">
                  Reschedule Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Patient requested morning slot"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setRescheduleAppt(null)}
                  className="px-3.5 py-2 rounded-lg border border-border hover:bg-accent text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingReschedule}
                  className="px-4 py-2 rounded-lg bg-[#007b92] text-white hover:bg-[#00667a] font-semibold transition-colors disabled:opacity-50"
                >
                  {savingReschedule ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelAppt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setCancelAppt(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-red-600 mb-1">
              Cancel Appointment
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {cancelAppt.appointmentNumber} — This action marks the appointment as cancelled.
            </p>

            <form onSubmit={handleSaveCancel} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-muted-foreground font-medium mb-1">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Patient unavailable / emergency conflict"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCancelAppt(null)}
                  className="px-3.5 py-2 rounded-lg border border-border hover:bg-accent text-foreground transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={savingCancel}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold transition-colors disabled:opacity-50"
                >
                  {savingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
