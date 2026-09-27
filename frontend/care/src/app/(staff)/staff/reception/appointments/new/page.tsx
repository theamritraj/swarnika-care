'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useReceptionSidebar } from '../../components/ReceptionSidebarContext';
import {
  CalendarPlus,
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  Users,
  Building2,
  Stethoscope,
  Calendar,
  Clock,
  UserCheck,
  RefreshCw
} from 'lucide-react';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  mrn: string;
  phone?: string;
}

interface Hospital {
  id: number;
  name: string;
  city?: string;
}

interface Department {
  id: number;
  name: string;
  hospitalId?: number;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialization?: string;
  hospitalId?: number;
  departmentId?: number;
}

interface Availability {
  id: number;
  doctorId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  status: string;
}

export default function ReceptionNewAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');
  const { activeHospitalId } = useReceptionSidebar();

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createdAppointment, setCreatedAppointment] = useState<any | null>(null);

  // Master Data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorAvailabilities, setDoctorAvailabilities] = useState<Availability[]>([]);

  // Wizard Form State
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    preselectedPatientId ? Number(preselectedPatientId) : null
  );
  const [patientSearch, setPatientSearch] = useState('');
  const [hospitalId, setHospitalId] = useState<number>(activeHospitalId || 1);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState<string>('10:00:00');
  const [endTime, setEndTime] = useState<string>('10:30:00');
  const [appointmentType, setAppointmentType] = useState<string>('OPD');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Check-in on success
  const [checkingIn, setCheckingIn] = useState(false);

  // Load master data
  useEffect(() => {
    async function loadData() {
      setInitLoading(true);
      try {
        const [pRes, hRes, depRes, docRes] = await Promise.all([
          fetch('/api/proxy/api/v1/patients'),
          fetch('/api/proxy/api/v1/hospitals'),
          fetch('/api/proxy/api/v1/departments'),
          fetch('/api/proxy/api/v1/doctors'),
        ]);

        if (pRes.ok) {
          const data = await pRes.json();
          setPatients(data.data || []);
        }
        if (hRes.ok) {
          const data = await hRes.json();
          const list = data.data || [];
          setHospitals(list);
          if (list.length > 0 && !hospitalId) {
            setHospitalId(list[0].id);
          }
        }
        if (depRes.ok) {
          const data = await depRes.json();
          const list = data.data || [];
          setDepartments(list);
          if (list.length > 0) setDepartmentId(list[0].id);
        }
        if (docRes.ok) {
          const data = await docRes.json();
          const list = data.data || [];
          setDoctors(list);
          if (list.length > 0) setDoctorId(list[0].id);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to initialize booking data');
      } finally {
        setInitLoading(false);
      }
    }
    loadData();
  }, []);

  // Fetch Doctor Availability whenever doctorId changes
  useEffect(() => {
    if (!doctorId) return;
    async function loadDocAvailability() {
      try {
        const res = await fetch(`/api/proxy/api/v1/doctors/${doctorId}/availability`);
        if (res.ok) {
          const data = await res.json();
          setDoctorAvailabilities(data.data || []);
        }
      } catch {
        // ignore
      }
    }
    loadDocAvailability();
  }, [doctorId]);

  // Filtered patients for selection
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients.slice(0, 10);
    const q = patientSearch.toLowerCase().trim();
    return patients.filter((p) => {
      const name = `${p.firstName} ${p.lastName}`.toLowerCase();
      return name.includes(q) || p.mrn?.toLowerCase().includes(q) || p.phone?.includes(q);
    });
  }, [patients, patientSearch]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  // Available Doctors filtered by department (if dept selected)
  const availableDoctors = useMemo(() => {
    if (!departmentId) return doctors;
    const filtered = doctors.filter((d) => !d.departmentId || d.departmentId === departmentId);
    return filtered.length > 0 ? filtered : doctors;
  }, [doctors, departmentId]);

  // Handle Form Submit
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !doctorId || !hospitalId || !departmentId) {
      setError('Please select patient, hospital, department, and attending doctor');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        patientId: selectedPatientId,
        doctorId: doctorId,
        hospitalId: hospitalId,
        departmentId: departmentId,
        appointmentDate: appointmentDate,
        startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
        endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
        appointmentType: appointmentType,
        reason: reason.trim() || 'General OPD Consultation',
        notes: notes.trim(),
      };

      const res = await fetch('/api/proxy/api/v1/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Appointment creation failed. Slot conflict or validation error.');
      }

      const resData = await res.json();
      setCreatedAppointment(resData.data);
    } catch (err: any) {
      setError(err.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  // Immediate check in for today's appointment
  const handleCheckInNow = async () => {
    if (!createdAppointment) return;
    setCheckingIn(true);
    setError(null);
    try {
      // 1. Confirm appointment
      await fetch(`/api/proxy/api/v1/appointments/${createdAppointment.id}/confirm`, {
        method: 'PATCH',
      });

      // 2. Create open OPD Encounter
      const encPayload = {
        patientId: createdAppointment.patientId,
        hospitalId: createdAppointment.hospitalId,
        departmentId: createdAppointment.departmentId,
        doctorId: createdAppointment.doctorId,
        encounterType: 'OPD',
        appointmentId: createdAppointment.id,
        source: 'APPOINTMENT',
        chiefComplaint: createdAppointment.reason || 'OPD Consultation Check-in',
      };

      await fetch('/api/proxy/api/v1/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encPayload),
      });

      router.push('/staff/reception/queue');
    } catch (err: any) {
      setError(err.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/staff/reception/appointments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Appointments</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Book Outpatient Appointment
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Schedule OPD consultation with real doctor availability validation and hospital scoping.
        </p>
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

      {/* Success View */}
      {createdAppointment ? (
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xs text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">
              Appointment Booked Successfully!
            </h2>
            <p className="text-xs font-mono font-semibold text-[#007b92] mt-1">
              Token / Reference: {createdAppointment.appointmentNumber}
            </p>
          </div>

          {/* Details summary */}
          <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date & Time:</span>
              <span className="font-semibold text-foreground">
                {createdAppointment.appointmentDate} ({createdAppointment.startTime?.slice(0, 5)})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Patient:</span>
              <span className="font-semibold text-foreground">
                {selectedPatient?.firstName} {selectedPatient?.lastName} ({selectedPatient?.mrn})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Consultation Reason:</span>
              <span className="font-semibold text-foreground">{createdAppointment.reason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-[#007b92] font-bold text-[10px]">
                {createdAppointment.status}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCheckInNow}
              disabled={checkingIn}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#007b92] text-white hover:bg-[#00667a] shadow-xs transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>{checkingIn ? 'Checking In...' : 'Check-in Now to Queue'}</span>
            </button>

            <Link
              href="/staff/reception/appointments"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-border hover:bg-accent text-foreground transition-colors"
            >
              <span>View Today's Schedule</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Booking Wizard Form */
        <form onSubmit={handleBookingSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-6">
          {/* Step 1: Patient Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#007b92]" />
                1. Select Patient
              </h2>
              <Link
                href="/staff/reception/patients/new"
                className="text-xs font-semibold text-[#007b92] hover:underline"
              >
                + Register New Patient
              </Link>
            </div>

            {selectedPatient ? (
              <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-[#007b92]/30 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-foreground">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </span>
                  <div className="flex items-center gap-2 text-muted-foreground mt-0.5">
                    <span className="font-mono text-[#007b92] font-semibold">{selectedPatient.mrn}</span>
                    {selectedPatient.phone && <span>• {selectedPatient.phone}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPatientId(null)}
                  className="text-xs text-[#007b92] hover:underline font-semibold"
                >
                  Change Patient
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search patient by name, MRN, phone..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto divide-y divide-border/50 border border-border rounded-lg">
                  {filteredPatients.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer flex items-center justify-between"
                    >
                      <span className="font-medium text-foreground">
                        {p.firstName} {p.lastName}
                      </span>
                      <span className="font-mono text-[11px] text-[#007b92]">{p.mrn}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Hospital & Department */}
          <div className="pt-4 border-t border-border">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#007b92]" />
              2. Facility & Clinical Specialty
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">Hospital Branch</label>
                <select
                  value={hospitalId}
                  onChange={(e) => setHospitalId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} {h.city ? `(${h.city})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Department</label>
                <select
                  value={departmentId || ''}
                  onChange={(e) => setDepartmentId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Doctor & Availability Preview */}
          <div className="pt-4 border-t border-border">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-[#007b92]" />
              3. Attending Doctor & Availability
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">Select Doctor</label>
                <select
                  value={doctorId || ''}
                  onChange={(e) => setDoctorId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  {availableDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.firstName} {doc.lastName} — {doc.specialization || 'Consultant'}
                    </option>
                  ))}
                </select>
              </div>

              {doctorAvailabilities.length > 0 ? (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border/60">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Scheduled Doctor Roster Slots:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {doctorAvailabilities.map((av) => (
                      <span
                        key={av.id}
                        className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-border/80 text-[11px] font-mono text-foreground"
                      >
                        {av.dayOfWeek}: {av.startTime?.slice(0, 5)} - {av.endTime?.slice(0, 5)} ({av.slotDurationMinutes}m)
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground italic">
                  Standard OPD hours (09:00 AM - 05:00 PM) apply.
                </p>
              )}
            </div>
          </div>

          {/* Step 4: Date & Slot */}
          <div className="pt-4 border-t border-border">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#007b92]" />
              4. Appointment Date & Time
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Appointment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Step 5: Type & Reason */}
          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">Appointment Type</label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="OPD">OPD In-Person Consultation</option>
                  <option value="CONSULTATION">Specialist Consultation</option>
                  <option value="FOLLOW_UP">Follow-up Visit</option>
                  <option value="PROCEDURE">Procedure</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Chief Reason for Visit</label>
                <input
                  type="text"
                  placeholder="e.g. Chest pain follow-up, routine checkup"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-foreground mb-1">Internal Front Desk Notes</label>
                <textarea
                  rows={2}
                  placeholder="Any coordination or administrative instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <Link
              href="/staff/reception/appointments"
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-border hover:bg-accent text-foreground transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !selectedPatientId}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#007b92] text-white hover:bg-[#00667a] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking Slot & Booking...</span>
                </>
              ) : (
                <>
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Confirm Appointment</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
