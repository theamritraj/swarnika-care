'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search, Calendar, Clock, User, Stethoscope, Building2,
  Layers, AlertCircle, RefreshCw, X, Filter, Eye,
  FileText, ChevronRight, Activity, CalendarDays, CheckCircle2,
  CalendarCheck, Plus, Check, AlertTriangle, ArrowRight, ArrowLeft
} from 'lucide-react';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface Appointment {
  id: number;
  appointmentNumber: string;
  patientId: number;
  doctorId: number;
  hospitalId: number;
  departmentId: number;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string;       // HH:mm:ss
  endTime: string;         // HH:mm:ss
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  appointmentType: 'OPD' | 'FOLLOW_UP' | 'CONSULTATION' | 'PROCEDURE' | 'OTHER';
  bookingSource: 'PATIENT_PORTAL' | 'RECEPTION' | 'DOCTOR' | 'ADMIN' | 'SYSTEM';
  reason?: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientLookup {
  id: number;
  mrn: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export interface DoctorAssignment {
  id: number;
  doctorId: number;
  hospitalId: number;
  departmentId: number;
  designation?: string;
  status: string;
}

export interface DoctorLookup {
  id: number;
  firstName: string;
  lastName: string;
  specialization?: string;
  email?: string;
  phone?: string;
  assignments?: DoctorAssignment[];
}

export interface HospitalLookup {
  id: number;
  code: string;
  name: string;
}

export interface DepartmentLookup {
  id: number;
  hospitalId: number;
  code: string;
  name: string;
}

export interface DoctorAvailability {
  id: number;
  doctorId: number;
  hospitalId: number;
  departmentId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface TimeSlotOption {
  startTime: string;
  endTime: string;
  label: string;
  isBooked: boolean;
}

// ==========================================
// CONSTANTS & FORMATTERS
// ==========================================

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'OPD', label: 'OPD Consultation' },
  { value: 'FOLLOW_UP', label: 'Follow Up' },
  { value: 'CONSULTATION', label: 'Specialist Consultation' },
  { value: 'PROCEDURE', label: 'Procedure' },
  { value: 'OTHER', label: 'Other' },
];

const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function formatTime(timeStr?: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const padded = hours < 10 ? `0${hours}` : `${hours}`;
  return `${padded}:${minutes} ${ampm}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

function getTodayIsoString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDayOfWeekName(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return DAYS_OF_WEEK[d.getDay()];
}

// Generate 30-min slot blocks between window start and end
function generateSlotsFromWindow(
  startStr: string,
  endStr: string,
  existingBookings: { startTime: string; endTime: string }[]
): TimeSlotOption[] {
  const slots: TimeSlotOption[] = [];
  const [sH, sM] = startStr.split(':').map(Number);
  const [eH, eM] = endStr.split(':').map(Number);

  let currentMin = sH * 60 + (sM || 0);
  const endMin = eH * 60 + (eM || 0);

  while (currentMin + 30 <= endMin) {
    const slotStartH = Math.floor(currentMin / 60);
    const slotStartM = currentMin % 60;
    const slotEndMin = currentMin + 30;
    const slotEndH = Math.floor(slotEndMin / 60);
    const slotEndM = slotEndMin % 60;

    const slotStartStr = `${String(slotStartH).padStart(2, '0')}:${String(slotStartM).padStart(2, '0')}:00`;
    const slotEndStr = `${String(slotEndH).padStart(2, '0')}:${String(slotEndM).padStart(2, '0')}:00`;

    // Check if slot overlaps with any active non-cancelled booking
    const isBooked = existingBookings.some((b) => {
      return (
        (slotStartStr >= b.startTime && slotStartStr < b.endTime) ||
        (slotEndStr > b.startTime && slotEndStr <= b.endTime) ||
        (slotStartStr <= b.startTime && slotEndStr >= b.endTime)
      );
    });

    slots.push({
      startTime: slotStartStr,
      endTime: slotEndStr,
      label: `${formatTime(slotStartStr)} – ${formatTime(slotEndStr)}`,
      isBooked
    });

    currentMin += 30;
  }

  return slots;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

function AppointmentsContent() {
  const searchParams = useSearchParams();
  const initialHospitalId = searchParams.get('hospitalId');
  const initialDoctorId = searchParams.get('doctorId');

  // Core Data
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Map<number, PatientLookup>>(new Map());
  const [doctors, setDoctors] = useState<Map<number, DoctorLookup>>(new Map());
  const [hospitals, setHospitals] = useState<HospitalLookup[]>([]);
  const [departments, setDepartments] = useState<DepartmentLookup[]>([]);

  // State Flags
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<string>(initialHospitalId || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>(initialDoctorId || 'all');

  // Detail Drawer State
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ==========================================
  // PHASE 3: MODAL STATES (Book, Confirm, Reschedule, Cancel, Complete, No-Show)
  // ==========================================
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookStep, setBookStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [isSubmittingMutation, setIsSubmittingMutation] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Booking Form State
  const [bookHospitalId, setBookHospitalId] = useState<string>('');
  const [bookDepartmentId, setBookDepartmentId] = useState<string>('');
  const [bookDoctorId, setBookDoctorId] = useState<string>('');
  const [bookPatientId, setBookPatientId] = useState<string>('');
  const [bookDate, setBookDate] = useState<string>('');
  const [bookStartTime, setBookStartTime] = useState<string>('');
  const [bookEndTime, setBookEndTime] = useState<string>('');
  const [bookType, setBookType] = useState<Appointment['appointmentType']>('OPD');
  const [bookReason, setBookReason] = useState<string>('');
  const [bookNotes, setBookNotes] = useState<string>('');

  // Doctor Availabilities Cache for Booking/Rescheduling
  const [doctorAvailabilities, setDoctorAvailabilities] = useState<DoctorAvailability[]>([]);
  const [loadingAvailabilities, setLoadingAvailabilities] = useState(false);

  // Patient Search inside Booking Modal
  const [patientSearchQuery, setPatientSearchQuery] = useState('');

  // Reschedule Modal State
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleStartTime, setRescheduleStartTime] = useState<string>('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState<string>('');
  const [rescheduleReason, setRescheduleReason] = useState<string>('');

  // Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  // Confirm / Complete / No-Show Prompt Modal
  const [promptModal, setPromptModal] = useState<{
    isOpen: boolean;
    type: 'CONFIRM' | 'COMPLETE' | 'NO_SHOW' | null;
    appointment: Appointment | null;
  }>({ isOpen: false, type: null, appointment: null });

  // 1. Fetch Lookups (Patients, Doctors with Directory assignments, Hospitals, Departments)
  async function loadLookups() {
    try {
      const [patRes, docRes, hospRes, deptRes] = await Promise.all([
        fetch('/api/proxy/api/v1/patients'),
        fetch('/api/proxy/api/v1/doctors/directory'),
        fetch('/api/proxy/api/v1/hospitals'),
        fetch('/api/proxy/api/v1/departments')
      ]);

      if (patRes.ok) {
        const json = await patRes.json();
        const list: PatientLookup[] = json.data || json || [];
        const map = new Map<number, PatientLookup>();
        list.forEach((p) => map.set(p.id, p));
        setPatients(map);
      }

      if (docRes.ok) {
        const json = await docRes.json();
        const list: DoctorLookup[] = json.data || json || [];
        const map = new Map<number, DoctorLookup>();
        list.forEach((d) => map.set(d.id, d));
        setDoctors(map);
      }

      if (hospRes.ok) {
        const json = await hospRes.json();
        const list: HospitalLookup[] = json.data || json || [];
        setHospitals(list);
      }

      if (deptRes.ok) {
        const json = await deptRes.json();
        const list: DepartmentLookup[] = json.data || json || [];
        setDepartments(list);
      }
    } catch (err) {
      console.error('Failed to load auxiliary lookup data', err);
    }
  }

  // 2. Fetch Authoritative Appointments
  async function loadAppointments(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/proxy/api/v1/appointments');
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `Failed to fetch appointments (HTTP ${res.status})`);
      }
      const json = await res.json();
      const list: Appointment[] = json.data || json || [];
      setAppointments(list);

      // Keep active appointment in sync if open
      if (activeAppointment) {
        const updatedActive = list.find((a) => a.id === activeAppointment.id);
        if (updatedActive) setActiveAppointment(updatedActive);
      }
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.message || 'Unable to load appointment records from backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadLookups();
    loadAppointments();
  }, []);

  // 3. Computed KPIs from Authoritative Dataset
  const todayIso = useMemo(() => getTodayIsoString(), []);

  const metrics = useMemo(() => {
    const total = appointments.length;
    const scheduled = appointments.filter((a) => a.status === 'SCHEDULED').length;
    const confirmed = appointments.filter((a) => a.status === 'CONFIRMED').length;
    const completed = appointments.filter((a) => a.status === 'COMPLETED').length;
    const cancelled = appointments.filter((a) => a.status === 'CANCELLED').length;
    const noShow = appointments.filter((a) => a.status === 'NO_SHOW').length;
    const todayBookings = appointments.filter((a) => a.appointmentDate === todayIso).length;

    return { total, scheduled, confirmed, completed, cancelled, noShow, todayBookings };
  }, [appointments, todayIso]);

  // 4. Client-side Multi-Criteria Filtering
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      // Hospital filter
      if (selectedHospital !== 'all' && a.hospitalId.toString() !== selectedHospital) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && a.status !== selectedStatus) {
        return false;
      }

      // Type filter
      if (selectedType !== 'all' && a.appointmentType !== selectedType) {
        return false;
      }

      // Doctor filter
      if (selectedDoctorFilter !== 'all' && a.doctorId.toString() !== selectedDoctorFilter) {
        return false;
      }

      // Date filter
      if (selectedDate && a.appointmentDate !== selectedDate) {
        return false;
      }

      // Search query (Appointment #, Patient Name, Patient MRN, Doctor Name, Reason)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const pat = patients.get(a.patientId);
        const doc = doctors.get(a.doctorId);

        const patName = pat ? `${pat.firstName} ${pat.lastName}`.toLowerCase() : '';
        const patMrn = pat?.mrn ? pat.mrn.toLowerCase() : '';
        const docName = doc ? `${doc.firstName} ${doc.lastName}`.toLowerCase() : '';
        const apptNum = a.appointmentNumber ? a.appointmentNumber.toLowerCase() : '';
        const reason = a.reason ? a.reason.toLowerCase() : '';

        const matches =
          apptNum.includes(q) ||
          patName.includes(q) ||
          patMrn.includes(q) ||
          docName.includes(q) ||
          reason.includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }, [
    appointments,
    patients,
    doctors,
    searchQuery,
    selectedHospital,
    selectedStatus,
    selectedType,
    selectedDoctorFilter,
    selectedDate
  ]);

  // Show Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // 5. Open Drawer
  const openViewDrawer = (appointment: Appointment) => {
    setActiveAppointment(appointment);
    setIsDrawerOpen(true);
  };

  // ==========================================
  // PHASE 3: BOOKING FLOW LOGIC
  // ==========================================

  const openBookAppointmentModal = () => {
    setBookHospitalId(hospitals[0]?.id?.toString() || '');
    setBookDepartmentId('');
    setBookDoctorId('');
    setBookPatientId('');
    setBookDate(getTodayIsoString());
    setBookStartTime('');
    setBookEndTime('');
    setBookType('OPD');
    setBookReason('');
    setBookNotes('');
    setBookStep(1);
    setMutationError(null);
    setDoctorAvailabilities([]);
    setIsBookModalOpen(true);
  };

  // Filtered departments based on selected hospital in booking modal
  const bookAvailableDepartments = useMemo(() => {
    if (!bookHospitalId) return [];
    return departments.filter((d) => d.hospitalId.toString() === bookHospitalId);
  }, [departments, bookHospitalId]);

  // Filtered doctors based on selected hospital & department assignments
  const bookAvailableDoctors = useMemo(() => {
    if (!bookHospitalId || !bookDepartmentId) return [];
    const list: DoctorLookup[] = [];
    doctors.forEach((doc) => {
      const isAssigned = doc.assignments?.some(
        (asgn) =>
          asgn.hospitalId.toString() === bookHospitalId &&
          asgn.departmentId.toString() === bookDepartmentId &&
          asgn.status === 'ACTIVE'
      );
      if (isAssigned) list.push(doc);
    });
    return list;
  }, [doctors, bookHospitalId, bookDepartmentId]);

  // Filtered patients for search in booking modal
  const bookFilteredPatients = useMemo(() => {
    const list: PatientLookup[] = [];
    patients.forEach((p) => {
      if (!patientSearchQuery.trim()) {
        list.push(p);
      } else {
        const q = patientSearchQuery.toLowerCase().trim();
        const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
        const mrn = p.mrn?.toLowerCase() || '';
        const phone = p.phone?.toLowerCase() || '';
        if (fullName.includes(q) || mrn.includes(q) || phone.includes(q)) {
          list.push(p);
        }
      }
    });
    return list;
  }, [patients, patientSearchQuery]);

  // Fetch Doctor Availability whenever Doctor changes or Date is chosen
  async function fetchDoctorAvailabilities(docId: string) {
    if (!docId) return;
    setLoadingAvailabilities(true);
    try {
      const res = await fetch(`/api/proxy/api/v1/doctors/${docId}/availability`);
      if (res.ok) {
        const json = await res.json();
        setDoctorAvailabilities(json.data || json || []);
      } else {
        setDoctorAvailabilities([]);
      }
    } catch (err) {
      console.error('Failed to load doctor availability slots', err);
      setDoctorAvailabilities([]);
    } finally {
      setLoadingAvailabilities(false);
    }
  }

  // Generate Available Time Slots for Selected Date and Doctor
  const generatedBookingSlots = useMemo(() => {
    if (!bookDoctorId || !bookDate || doctorAvailabilities.length === 0) return [];

    const dayName = getDayOfWeekName(bookDate);
    const dayAvails = doctorAvailabilities.filter(
      (a) => a.isActive && a.dayOfWeek.toUpperCase() === dayName
    );

    if (dayAvails.length === 0) return [];

    // Find existing non-cancelled bookings for this doctor on this date
    const existingDoctorBookings = appointments
      .filter(
        (a) =>
          a.doctorId.toString() === bookDoctorId &&
          a.appointmentDate === bookDate &&
          a.status !== 'CANCELLED'
      )
      .map((a) => ({ startTime: a.startTime, endTime: a.endTime }));

    const allSlots: TimeSlotOption[] = [];
    dayAvails.forEach((avail) => {
      const slots = generateSlotsFromWindow(avail.startTime, avail.endTime, existingDoctorBookings);
      allSlots.push(...slots);
    });

    return allSlots;
  }, [bookDoctorId, bookDate, doctorAvailabilities, appointments]);

  // Submit Booking
  const handleBookingSubmit = async () => {
    setIsSubmittingMutation(true);
    setMutationError(null);

    try {
      if (!bookHospitalId || !bookDepartmentId || !bookDoctorId || !bookPatientId) {
        throw new Error('Please complete all facility, doctor, and patient selections.');
      }
      if (!bookDate || !bookStartTime || !bookEndTime) {
        throw new Error('Please select an appointment date and valid time slot.');
      }
      if (!bookReason.trim()) {
        throw new Error('Please provide the clinical consultation reason.');
      }

      const payload = {
        hospitalId: Number(bookHospitalId),
        departmentId: Number(bookDepartmentId),
        doctorId: Number(bookDoctorId),
        patientId: Number(bookPatientId),
        appointmentDate: bookDate,
        startTime: bookStartTime,
        endTime: bookEndTime,
        appointmentType: bookType,
        reason: bookReason.trim(),
        notes: bookNotes.trim() || null
      };

      const res = await fetch('/api/proxy/api/v1/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error(json?.message || 'The requested time slot conflicts with an existing appointment for this doctor.');
        }
        throw new Error(json?.message || `Booking failed (HTTP ${res.status})`);
      }

      const created = json.data || json;
      triggerToast(`Appointment ${created.appointmentNumber} booked successfully!`);
      setIsBookModalOpen(false);
      loadAppointments(true);
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setMutationError(err.message || 'Failed to complete appointment booking.');
    } finally {
      setIsSubmittingMutation(false);
    }
  };

  // ==========================================
  // PHASE 3: LIFECYCLE MUTATION HANDLERS
  // ==========================================

  // 1. Confirm Appointment
  const executeConfirmAppointment = async (appt: Appointment) => {
    setIsSubmittingMutation(true);
    setMutationError(null);
    try {
      const res = await fetch(`/api/proxy/api/v1/appointments/${appt.id}/confirm`, {
        method: 'PATCH'
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Failed to confirm appointment (HTTP ${res.status})`);
      }
      triggerToast(`Appointment ${appt.appointmentNumber} confirmed successfully!`);
      setPromptModal({ isOpen: false, type: null, appointment: null });
      loadAppointments(true);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmittingMutation(false);
    }
  };

  // 2. Open Reschedule Modal
  const openRescheduleModal = (appt: Appointment) => {
    setRescheduleTarget(appt);
    setRescheduleDate(appt.appointmentDate);
    setRescheduleStartTime('');
    setRescheduleEndTime('');
    setRescheduleReason('');
    setMutationError(null);
    fetchDoctorAvailabilities(appt.doctorId.toString());
    setIsRescheduleModalOpen(true);
  };

  // Generate Slots for Reschedule
  const generatedRescheduleSlots = useMemo(() => {
    if (!rescheduleTarget || !rescheduleDate || doctorAvailabilities.length === 0) return [];
    const dayName = getDayOfWeekName(rescheduleDate);
    const dayAvails = doctorAvailabilities.filter(
      (a) => a.isActive && a.dayOfWeek.toUpperCase() === dayName
    );
    if (dayAvails.length === 0) return [];

    const existingDoctorBookings = appointments
      .filter(
        (a) =>
          a.id !== rescheduleTarget.id &&
          a.doctorId === rescheduleTarget.doctorId &&
          a.appointmentDate === rescheduleDate &&
          a.status !== 'CANCELLED'
      )
      .map((a) => ({ startTime: a.startTime, endTime: a.endTime }));

    const allSlots: TimeSlotOption[] = [];
    dayAvails.forEach((avail) => {
      const slots = generateSlotsFromWindow(avail.startTime, avail.endTime, existingDoctorBookings);
      allSlots.push(...slots);
    });

    return allSlots;
  }, [rescheduleTarget, rescheduleDate, doctorAvailabilities, appointments]);

  // Submit Reschedule
  const handleRescheduleSubmit = async () => {
    if (!rescheduleTarget) return;
    setIsSubmittingMutation(true);
    setMutationError(null);

    try {
      if (!rescheduleDate || !rescheduleStartTime || !rescheduleEndTime) {
        throw new Error('Please select a new date and valid time slot.');
      }
      if (!rescheduleReason.trim()) {
        throw new Error('Please enter the reason for rescheduling.');
      }

      const payload = {
        newAppointmentDate: rescheduleDate,
        newStartTime: rescheduleStartTime,
        newEndTime: rescheduleEndTime,
        reason: rescheduleReason.trim()
      };

      const res = await fetch(`/api/proxy/api/v1/appointments/${rescheduleTarget.id}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Failed to reschedule appointment (HTTP ${res.status})`);
      }

      triggerToast(`Appointment ${rescheduleTarget.appointmentNumber} rescheduled to ${formatDate(rescheduleDate)} at ${formatTime(rescheduleStartTime)}.`);
      setIsRescheduleModalOpen(false);
      loadAppointments(true);
    } catch (err: any) {
      console.error('Reschedule error:', err);
      setMutationError(err.message || 'Failed to reschedule appointment.');
    } finally {
      setIsSubmittingMutation(false);
    }
  };

  // 3. Open Cancel Modal
  const openCancelModal = (appt: Appointment) => {
    setCancelTarget(appt);
    setCancelReason('');
    setMutationError(null);
    setIsCancelModalOpen(true);
  };

  // Submit Cancel
  const handleCancelSubmit = async () => {
    if (!cancelTarget) return;
    setIsSubmittingMutation(true);
    setMutationError(null);

    try {
      if (!cancelReason.trim()) {
        throw new Error('Please provide the cancellation reason.');
      }

      const payload = {
        reason: cancelReason.trim()
      };

      const res = await fetch(`/api/proxy/api/v1/appointments/${cancelTarget.id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Cancellation failed (HTTP ${res.status})`);
      }

      triggerToast(`Appointment ${cancelTarget.appointmentNumber} has been cancelled.`);
      setIsCancelModalOpen(false);
      loadAppointments(true);
    } catch (err: any) {
      console.error('Cancel error:', err);
      setMutationError(err.message || 'Failed to cancel appointment.');
    } finally {
      setIsSubmittingMutation(false);
    }
  };

  // 4. Execute Complete Appointment
  const executeCompleteAppointment = async (appt: Appointment) => {
    setIsSubmittingMutation(true);
    try {
      const res = await fetch(`/api/proxy/api/v1/appointments/${appt.id}/complete`, {
        method: 'PATCH'
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Failed to complete appointment (HTTP ${res.status})`);
      }
      triggerToast(`Appointment ${appt.appointmentNumber} marked as Completed.`);
      setPromptModal({ isOpen: false, type: null, appointment: null });
      loadAppointments(true);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmittingMutation(false);
    }
  };

  // 5. Execute Mark No-Show
  const executeNoShowAppointment = async (appt: Appointment) => {
    setIsSubmittingMutation(true);
    try {
      const res = await fetch(`/api/proxy/api/v1/appointments/${appt.id}/no-show`, {
        method: 'PATCH'
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Failed to mark no-show (HTTP ${res.status})`);
      }
      triggerToast(`Appointment ${appt.appointmentNumber} marked as No-Show.`);
      setPromptModal({ isOpen: false, type: null, appointment: null });
      loadAppointments(true);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmittingMutation(false);
    }
  };

  // Visual Badge Helpers
  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5 animate-pulse"></span>
            Scheduled
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></span>
            Confirmed
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-1.5"></span>
            Cancelled
          </span>
        );
      case 'NO_SHOW':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-1.5"></span>
            No Show
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
            {status}
          </span>
        );
    }
  };

  const getTypeBadge = (type: Appointment['appointmentType']) => {
    switch (type) {
      case 'OPD':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800">
            OPD
          </span>
        );
      case 'FOLLOW_UP':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800">
            Follow Up
          </span>
        );
      case 'CONSULTATION':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-800 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
            Consultation
          </span>
        );
      case 'PROCEDURE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
            Procedure
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {type}
          </span>
        );
    }
  };

  const getBookingSourceLabel = (source: Appointment['bookingSource']) => {
    switch (source) {
      case 'PATIENT_PORTAL':
        return 'Patient Portal';
      case 'RECEPTION':
        return 'Front Desk';
      case 'DOCTOR':
        return 'Doctor Prescribed';
      case 'ADMIN':
        return 'Super Admin';
      case 'SYSTEM':
        return 'Automated System';
      default:
        return source || 'Standard';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/90 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-100 shadow-xl animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{toastMessage}</p>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:text-emerald-900 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Error Loading Appointments</p>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">{error}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadAppointments(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
            >
              Retry
            </button>
            <button
              onClick={() => setError(null)}
              className="text-rose-600 hover:text-rose-800 dark:hover:text-rose-100 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#007b92]">
            <CalendarCheck className="w-4 h-4" />
            <span>Outpatient Scheduling & Bookings</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-card-foreground mt-1">
            Appointment Directory
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Monitor real-time bookings, scheduling queues, patient check-ins, and multi-hospital appointment pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadAppointments(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-3.5 py-2 border border-border rounded-lg text-sm font-medium text-foreground bg-card hover:bg-muted transition shadow-xs disabled:opacity-50"
            title="Refresh Appointment Directory"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={openBookAppointmentModal}
            className="bg-[#007b92] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#006072] transition flex items-center gap-2 shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Authoritative Live KPI Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-card p-3 rounded-xl border border-border shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-muted-foreground">Total Bookings</span>
          <span className="text-2xl font-bold text-foreground mt-1">{metrics.total}</span>
        </div>
        <div className="bg-card p-3 rounded-xl border border-border shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Scheduled
          </span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{metrics.scheduled}</span>
        </div>
        <div className="bg-card p-3 rounded-xl border border-border shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Confirmed
          </span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{metrics.confirmed}</span>
        </div>
        <div className="bg-card p-3 rounded-xl border border-border shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Completed
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{metrics.completed}</span>
        </div>
        <div className="bg-card p-3 rounded-xl border border-border shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Cancelled
          </span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{metrics.cancelled}</span>
        </div>
        <div className="bg-card p-3 rounded-xl border border-border shadow-xs flex flex-col justify-between bg-teal-50/20 dark:bg-teal-950/10">
          <span className="text-xs font-semibold text-[#007b92] flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5" /> Today's Load
          </span>
          <span className="text-2xl font-bold text-[#007b92] mt-1">{metrics.todayBookings}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Real Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Apt #, patient name, MRN, doctor..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] focus:bg-card transition-all placeholder:text-muted-foreground/60 text-foreground"
            />
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-wrap">
            {/* Hospital Selector */}
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="bg-background border border-border text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92] text-foreground font-medium"
            >
              <option value="all">All Hospitals</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id.toString()}>
                  {h.name}
                </option>
              ))}
            </select>

            {/* Status Selector */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-background border border-border text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92] text-foreground font-medium"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Type Selector */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-background border border-border text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92] text-foreground font-medium"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Date Selector */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-background border border-border text-xs rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-[#007b92] text-foreground"
              title="Filter by Appointment Date"
            />
          </div>
        </div>

        {/* Active Filter Pills */}
        {(selectedHospital !== 'all' || selectedStatus !== 'all' || selectedType !== 'all' || selectedDate || searchQuery || selectedDoctorFilter !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40 text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <Filter className="w-3 h-3" /> Active Filters:
            </span>
            {selectedHospital !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">
                Hospital: {hospitals.find((h) => h.id.toString() === selectedHospital)?.name || selectedHospital}
                <button onClick={() => setSelectedHospital('all')} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">
                Status: {selectedStatus}
                <button onClick={() => setSelectedStatus('all')} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">
                Type: {selectedType}
                <button onClick={() => setSelectedType('all')} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedDate && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">
                Date: {formatDate(selectedDate)}
                <button onClick={() => setSelectedDate('')} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedDoctorFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">
                Doctor: Dr. {doctors.get(Number(selectedDoctorFilter))?.firstName || selectedDoctorFilter}
                <button onClick={() => setSelectedDoctorFilter('all')} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedHospital('all');
                setSelectedStatus('all');
                setSelectedType('all');
                setSelectedDate('');
                setSelectedDoctorFilter('all');
                setSearchQuery('');
              }}
              className="text-[#007b92] hover:underline font-semibold ml-2"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Main Authoritative Appointment Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 bg-muted/50 animate-pulse rounded-lg w-full"></div>
              ))}
            </div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-16 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/30 text-[#007b92] flex items-center justify-center mx-auto">
              <CalendarCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">No appointment records found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedHospital !== 'all' || selectedStatus !== 'all' || selectedType !== 'all' || selectedDate || searchQuery
                  ? 'No appointments match your active search or filter criteria. Try clearing filters.'
                  : 'There are currently no appointments registered in the database.'}
              </p>
            </div>
            <button
              onClick={openBookAppointmentModal}
              className="bg-[#007b92] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#006072] transition text-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Book First Appointment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Appointment #</th>
                  <th className="px-6 py-3.5">Patient Details</th>
                  <th className="px-6 py-3.5">Doctor & Specialty</th>
                  <th className="px-6 py-3.5">Facility & Department</th>
                  <th className="px-6 py-3.5">Date & Time Window</th>
                  <th className="px-6 py-3.5">Type & Source</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAppointments.map((a) => {
                  const pat = patients.get(a.patientId);
                  const doc = doctors.get(a.doctorId);
                  const hosp = hospitals.find((h) => h.id === a.hospitalId);
                  const dept = departments.find((d) => d.id === a.departmentId);

                  const isToday = a.appointmentDate === todayIso;

                  return (
                    <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                      {/* Appointment Number */}
                      <td className="px-6 py-4 font-mono text-xs">
                        <div className="font-bold text-foreground">{a.appointmentNumber}</div>
                        <div className="text-[11px] text-muted-foreground font-sans mt-0.5">
                          ID: #{a.id}
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">
                          {pat ? `${pat.firstName} ${pat.lastName}` : `Patient #${a.patientId}`}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[#007b92]">{pat?.mrn || 'MRN-Pending'}</span>
                          {pat?.phone && (
                            <>
                              <span>•</span>
                              <span>{pat.phone}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-[#007b92]" />
                          <span>{doc ? `Dr. ${doc.firstName} ${doc.lastName}` : `Doctor #${a.doctorId}`}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {doc?.specialization || 'General Consultation'}
                        </div>
                      </td>

                      {/* Hospital & Department */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground/70" />
                          <span>{hosp ? hosp.name : `Hospital #${a.hospitalId}`}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Layers className="w-3 h-3 text-muted-foreground/60" />
                          <span>{dept ? dept.name : `Department #${a.departmentId}`}</span>
                        </div>
                      </td>

                      {/* Date & Time Window */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{formatDate(a.appointmentDate)}</span>
                          {isToday && (
                            <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-teal-100 text-[#007b92] dark:bg-teal-950 dark:text-teal-300">
                              TODAY
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3 text-muted-foreground/70" />
                          <span>
                            {formatTime(a.startTime)} – {formatTime(a.endTime)}
                          </span>
                        </div>
                      </td>

                      {/* Type & Booking Source */}
                      <td className="px-6 py-4">
                        <div>{getTypeBadge(a.appointmentType)}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">
                          Via {getBookingSourceLabel(a.bookingSource)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">{getStatusBadge(a.status)}</td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Lifecycle Buttons */}
                          {a.status === 'SCHEDULED' && (
                            <button
                              onClick={() => setPromptModal({ isOpen: true, type: 'CONFIRM', appointment: a })}
                              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
                              title="Confirm Appointment"
                            >
                              Confirm
                            </button>
                          )}

                          {(a.status === 'SCHEDULED' || a.status === 'CONFIRMED') && (
                            <>
                              <button
                                onClick={() => openRescheduleModal(a)}
                                className="px-2 py-1 rounded-md text-xs font-medium border border-border hover:bg-muted text-foreground transition"
                                title="Reschedule"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => openCancelModal(a)}
                                className="px-2 py-1 rounded-md text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition"
                                title="Cancel"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => openViewDrawer(a)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border hover:bg-muted text-foreground text-xs font-medium transition shadow-2xs"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Details</span>
                          </button>
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

      {/* Slide-Over Drawer: Appointment Details with Lifecycle Actions */}
      {isDrawerOpen && activeAppointment && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-card border-l border-border h-full shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#007b92] font-semibold">
                  Appointment Record
                </span>
                <h2 className="text-xl font-bold text-foreground mt-0.5 font-mono">
                  {activeAppointment.appointmentNumber}
                </h2>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Status Banner */}
              <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Current Booking Status</div>
                  <div className="mt-1">{getStatusBadge(activeAppointment.status)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Appointment Type</div>
                  <div className="mt-1">{getTypeBadge(activeAppointment.appointmentType)}</div>
                </div>
              </div>

              {/* Patient Card */}
              {(() => {
                const pat = patients.get(activeAppointment.patientId);
                return (
                  <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#007b92]" />
                      <span>Patient Information</span>
                    </div>
                    <div className="text-base font-bold text-foreground">
                      {pat ? `${pat.firstName} ${pat.lastName}` : `Patient #${activeAppointment.patientId}`}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-muted-foreground">MRN:</span>{' '}
                        <span className="font-mono font-semibold text-[#007b92]">
                          {pat?.mrn || 'Unavailable'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span>{' '}
                        <span className="text-foreground">{pat?.phone || 'Unavailable'}</span>
                      </div>
                      {pat?.email && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Email:</span>{' '}
                          <span className="text-foreground">{pat.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Doctor Card */}
              {(() => {
                const doc = doctors.get(activeAppointment.doctorId);
                return (
                  <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-[#007b92]" />
                      <span>Doctor & Specialty</span>
                    </div>
                    <div className="text-base font-bold text-foreground">
                      {doc ? `Dr. ${doc.firstName} ${doc.lastName}` : `Doctor #${activeAppointment.doctorId}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Specialization: <span className="font-medium text-foreground">{doc?.specialization || 'General'}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Facility & Department */}
              {(() => {
                const hosp = hospitals.find((h) => h.id === activeAppointment.hospitalId);
                const dept = departments.find((d) => d.id === activeAppointment.departmentId);
                return (
                  <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Facility Deployment</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Hospital:</span>
                        <div className="font-semibold text-foreground mt-0.5">
                          {hosp ? hosp.name : `Hospital #${activeAppointment.hospitalId}`}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Department:</span>
                        <div className="font-semibold text-foreground mt-0.5">
                          {dept ? dept.name : `Department #${activeAppointment.departmentId}`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Timing & Schedule */}
              <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Scheduled Time Slot</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <div className="font-semibold text-foreground mt-0.5">
                      {formatDate(activeAppointment.appointmentDate)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time Window:</span>
                    <div className="font-semibold text-foreground mt-0.5">
                      {formatTime(activeAppointment.startTime)} – {formatTime(activeAppointment.endTime)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Booking Source:</span>
                    <div className="text-foreground mt-0.5">
                      {getBookingSourceLabel(activeAppointment.bookingSource)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">System ID:</span>
                    <div className="font-mono text-muted-foreground mt-0.5">
                      #{activeAppointment.id}
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Reason & Notes */}
              {(activeAppointment.reason || activeAppointment.notes) && (
                <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Clinical Consultation Notes</span>
                  </div>
                  {activeAppointment.reason && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Primary Reason:</span>
                      <p className="text-foreground mt-0.5 font-medium">{activeAppointment.reason}</p>
                    </div>
                  )}
                  {activeAppointment.notes && (
                    <div className="text-xs pt-1">
                      <span className="text-muted-foreground">Additional Notes:</span>
                      <p className="text-foreground/90 whitespace-pre-line mt-0.5 bg-muted/40 p-2.5 rounded-lg border border-border/40 font-mono text-[11px]">
                        {activeAppointment.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Cancellation Audit */}
              {activeAppointment.status === 'CANCELLED' && (
                <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20 space-y-1.5 text-xs text-rose-900 dark:text-rose-200">
                  <div className="font-semibold flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Cancellation Audit</span>
                  </div>
                  <div>
                    <span className="font-medium">Reason:</span>{' '}
                    <span>{activeAppointment.cancellationReason || 'No reason specified'}</span>
                  </div>
                  {activeAppointment.cancelledAt && (
                    <div>
                      <span className="font-medium">Cancelled At:</span>{' '}
                      <span>{new Date(activeAppointment.cancelledAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Completion Audit */}
              {activeAppointment.status === 'COMPLETED' && activeAppointment.completedAt && (
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="font-semibold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Encounter Completed</span>
                  </div>
                  <div>
                    <span className="font-medium">Completed At:</span>{' '}
                    <span>{new Date(activeAppointment.completedAt).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Lifecycle Actions inside Drawer */}
              {(activeAppointment.status === 'SCHEDULED' || activeAppointment.status === 'CONFIRMED') && (
                <div className="pt-2 border-t border-border space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Available Actions
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {activeAppointment.status === 'SCHEDULED' && (
                      <button
                        onClick={() => {
                          setIsDrawerOpen(false);
                          setPromptModal({ isOpen: true, type: 'CONFIRM', appointment: activeAppointment });
                        }}
                        className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        Confirm Booking
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsDrawerOpen(false);
                        openRescheduleModal(activeAppointment);
                      }}
                      className="w-full py-2 px-3 rounded-lg text-xs font-semibold border border-border hover:bg-muted text-foreground transition"
                    >
                      Reschedule
                    </button>

                    <button
                      onClick={() => {
                        setIsDrawerOpen(false);
                        setPromptModal({ isOpen: true, type: 'COMPLETE', appointment: activeAppointment });
                      }}
                      className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                    >
                      Mark Completed
                    </button>

                    <button
                      onClick={() => {
                        setIsDrawerOpen(false);
                        setPromptModal({ isOpen: true, type: 'NO_SHOW', appointment: activeAppointment });
                      }}
                      className="w-full py-2 px-3 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-muted transition"
                    >
                      Mark No-Show
                    </button>

                    <button
                      onClick={() => {
                        setIsDrawerOpen(false);
                        openCancelModal(activeAppointment);
                      }}
                      className="col-span-2 py-2 px-3 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900 hover:bg-rose-100 transition"
                    >
                      Cancel Appointment
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/10 flex justify-end">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition text-foreground"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* PHASE 3: MULTI-STEP BOOK APPOINTMENT MODAL */}
      {/* ========================================== */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header & Progress */}
            <div className="p-6 border-b border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#007b92]">
                    Step {bookStep} of 6
                  </span>
                  <h3 className="text-xl font-bold text-foreground mt-0.5">Book New Appointment</h3>
                </div>
                <button
                  onClick={() => setIsBookModalOpen(false)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step Progress Bar */}
              <div className="grid grid-cols-6 gap-1.5 mt-4">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all ${
                      s <= bookStep ? 'bg-[#007b92]' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {mutationError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p>{mutationError}</p>
                </div>
              )}

              {/* STEP 1: Facility Selection (Hospital & Department) */}
              {bookStep === 1 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Select Hospital & Department</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Hospital Facility <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={bookHospitalId}
                        onChange={(e) => {
                          setBookHospitalId(e.target.value);
                          setBookDepartmentId('');
                          setBookDoctorId('');
                        }}
                        className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#007b92] text-foreground"
                      >
                        <option value="">-- Choose Hospital --</option>
                        {hospitals.map((h) => (
                          <option key={h.id} value={h.id.toString()}>
                            {h.name} ({h.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Clinical Department <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={bookDepartmentId}
                        disabled={!bookHospitalId}
                        onChange={(e) => {
                          setBookDepartmentId(e.target.value);
                          setBookDoctorId('');
                        }}
                        className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#007b92] text-foreground disabled:opacity-50"
                      >
                        <option value="">-- Choose Department --</option>
                        {bookAvailableDepartments.map((dept) => (
                          <option key={dept.id} value={dept.id.toString()}>
                            {dept.name} ({dept.code})
                          </option>
                        ))}
                      </select>
                      {bookHospitalId && bookAvailableDepartments.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          No departments currently registered under this hospital.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Doctor Selection */}
              {bookStep === 2 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">
                    Select Doctor Assigned to Department
                  </h4>
                  {bookAvailableDoctors.length === 0 ? (
                    <div className="p-8 text-center bg-muted/20 border border-border rounded-xl text-muted-foreground text-sm">
                      <Stethoscope className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="font-semibold text-foreground">No doctors assigned</p>
                      <p className="text-xs mt-1">
                        There are no active doctors assigned to the selected hospital & department.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                      {bookAvailableDoctors.map((doc) => {
                        const isSelected = bookDoctorId === doc.id.toString();
                        return (
                          <div
                            key={doc.id}
                            onClick={() => {
                              setBookDoctorId(doc.id.toString());
                              fetchDoctorAvailabilities(doc.id.toString());
                            }}
                            className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start justify-between ${
                              isSelected
                                ? 'bg-teal-50/50 border-[#007b92] dark:bg-teal-950/30'
                                : 'border-border bg-background hover:bg-muted/40'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                                <Stethoscope className="w-4 h-4 text-[#007b92]" />
                                <span>Dr. {doc.firstName} {doc.lastName}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {doc.specialization || 'Consultant Specialist'}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[#007b92] text-white flex items-center justify-center shrink-0">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Patient Selection */}
              {bookStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">Select Patient</h4>
                    <span className="text-xs text-muted-foreground">
                      Must be registered in Patient Service
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                      placeholder="Search patient by name, MRN, or phone..."
                      className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92] text-foreground"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {bookFilteredPatients.length === 0 ? (
                      <div className="p-6 text-center text-sm text-muted-foreground bg-muted/20 rounded-xl">
                        No registered patients found matching query.
                      </div>
                    ) : (
                      bookFilteredPatients.map((pat) => {
                        const isSelected = bookPatientId === pat.id.toString();
                        return (
                          <div
                            key={pat.id}
                            onClick={() => setBookPatientId(pat.id.toString())}
                            className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                              isSelected
                                ? 'bg-teal-50/50 border-[#007b92] dark:bg-teal-950/30'
                                : 'border-border bg-background hover:bg-muted/40'
                            }`}
                          >
                            <div>
                              <div className="font-semibold text-sm text-foreground">
                                {pat.firstName} {pat.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[#007b92]">{pat.mrn}</span>
                                {pat.phone && <span>• {pat.phone}</span>}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[#007b92] text-white flex items-center justify-center">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: Date & Time Slot Selection */}
              {bookStep === 4 && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-foreground">Choose Date & Slot</h4>
                    <span className="text-xs text-muted-foreground">
                      Day: {bookDate ? getDayOfWeekName(bookDate) : ''}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Consultation Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      min={getTodayIsoString()}
                      value={bookDate}
                      onChange={(e) => {
                        setBookDate(e.target.value);
                        setBookStartTime('');
                        setBookEndTime('');
                      }}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#007b92] text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      Available Consultation Windows
                    </label>

                    {loadingAvailabilities ? (
                      <div className="p-8 text-center text-sm text-muted-foreground">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#007b92]" />
                        Loading doctor availability...
                      </div>
                    ) : generatedBookingSlots.length === 0 ? (
                      <div className="p-6 text-center bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-sm">
                        <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                        <p className="font-semibold">No availability on this day</p>
                        <p className="text-xs mt-0.5">
                          Doctor has no active shifts on {bookDate ? getDayOfWeekName(bookDate) : 'this date'}. Please select another date.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                        {generatedBookingSlots.map((slot, idx) => {
                          const isSelected = bookStartTime === slot.startTime;
                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={slot.isBooked}
                              onClick={() => {
                                setBookStartTime(slot.startTime);
                                setBookEndTime(slot.endTime);
                              }}
                              className={`p-2.5 rounded-lg text-xs font-medium border text-center transition ${
                                slot.isBooked
                                  ? 'bg-muted text-muted-foreground/50 border-border cursor-not-allowed line-through'
                                  : isSelected
                                  ? 'bg-[#007b92] text-white border-[#007b92] shadow-xs'
                                  : 'bg-background hover:bg-muted text-foreground border-border'
                              }`}
                            >
                              <div>{slot.label}</div>
                              {slot.isBooked && (
                                <div className="text-[10px] text-rose-500 font-normal no-underline">
                                  Booked
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: Type & Reason */}
              {bookStep === 5 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Appointment Type & Clinical Details</h4>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Appointment Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={bookType}
                      onChange={(e) => setBookType(e.target.value as any)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#007b92] text-foreground font-medium"
                    >
                      <option value="OPD">OPD Consultation</option>
                      <option value="FOLLOW_UP">Follow Up</option>
                      <option value="CONSULTATION">Specialist Consultation</option>
                      <option value="PROCEDURE">Procedure</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Primary Clinical Reason <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={bookReason}
                      onChange={(e) => setBookReason(e.target.value)}
                      placeholder="e.g. Chest pain evaluation, Routine follow-up..."
                      className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#007b92] text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Internal Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={bookNotes}
                      onChange={(e) => setBookNotes(e.target.value)}
                      placeholder="Additional instructions or background remarks..."
                      className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#007b92] text-foreground resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 6: Review & Confirm */}
              {bookStep === 6 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Review Appointment Summary</h4>

                  <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border/50">
                      <div>
                        <span className="text-muted-foreground">Patient:</span>
                        <div className="font-semibold text-foreground mt-0.5">
                          {patients.get(Number(bookPatientId))?.firstName} {patients.get(Number(bookPatientId))?.lastName}
                        </div>
                        <div className="text-[11px] font-mono text-[#007b92]">
                          {patients.get(Number(bookPatientId))?.mrn}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Doctor:</span>
                        <div className="font-semibold text-foreground mt-0.5">
                          Dr. {doctors.get(Number(bookDoctorId))?.firstName} {doctors.get(Number(bookDoctorId))?.lastName}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {doctors.get(Number(bookDoctorId))?.specialization || 'Consultant'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border/50">
                      <div>
                        <span className="text-muted-foreground">Facility & Department:</span>
                        <div className="font-medium text-foreground mt-0.5">
                          {hospitals.find((h) => h.id.toString() === bookHospitalId)?.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {departments.find((d) => d.id.toString() === bookDepartmentId)?.name}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Schedule Window:</span>
                        <div className="font-medium text-foreground mt-0.5">
                          {formatDate(bookDate)}
                        </div>
                        <div className="text-[11px] text-[#007b92] font-semibold">
                          {formatTime(bookStartTime)} – {formatTime(bookEndTime)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Type & Reason:</span>
                      <div className="font-medium text-foreground mt-0.5 flex items-center gap-2">
                        {getTypeBadge(bookType)}
                        <span>{bookReason}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-border bg-muted/10 flex items-center justify-between">
              {bookStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setBookStep((s) => (s - 1) as any)}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted text-foreground flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted text-foreground"
                >
                  Cancel
                </button>
              )}

              {bookStep < 6 ? (
                <button
                  type="button"
                  disabled={
                    (bookStep === 1 && (!bookHospitalId || !bookDepartmentId)) ||
                    (bookStep === 2 && !bookDoctorId) ||
                    (bookStep === 3 && !bookPatientId) ||
                    (bookStep === 4 && (!bookDate || !bookStartTime)) ||
                    (bookStep === 5 && !bookReason.trim())
                  }
                  onClick={() => setBookStep((s) => (s + 1) as any)}
                  className="px-5 py-2 bg-[#007b92] text-white rounded-lg text-sm font-medium hover:bg-[#006072] transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmittingMutation}
                  onClick={handleBookingSubmit}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  {isSubmittingMutation ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm Booking</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* PHASE 3: RESCHEDULE APPOINTMENT MODAL */}
      {/* ========================================== */}
      {isRescheduleModalOpen && rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#007b92] font-semibold">
                  Reschedule Appointment
                </span>
                <h3 className="text-lg font-bold text-foreground mt-0.5 font-mono">
                  {rescheduleTarget.appointmentNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsRescheduleModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {mutationError && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200 text-xs">
                  {mutationError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  New Appointment Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  min={getTodayIsoString()}
                  value={rescheduleDate}
                  onChange={(e) => {
                    setRescheduleDate(e.target.value);
                    setRescheduleStartTime('');
                    setRescheduleEndTime('');
                  }}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#007b92] text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  Select New Time Slot <span className="text-rose-500">*</span>
                </label>
                {generatedRescheduleSlots.length === 0 ? (
                  <div className="p-4 text-center text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-lg">
                    No doctor availability slots on this date. Please choose another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {generatedRescheduleSlots.map((slot, idx) => {
                      const isSelected = rescheduleStartTime === slot.startTime;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={slot.isBooked}
                          onClick={() => {
                            setRescheduleStartTime(slot.startTime);
                            setRescheduleEndTime(slot.endTime);
                          }}
                          className={`p-2 rounded-lg text-xs font-medium border text-center transition ${
                            slot.isBooked
                              ? 'bg-muted text-muted-foreground/40 border-border cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-[#007b92] text-white border-[#007b92]'
                              : 'bg-background hover:bg-muted text-foreground border-border'
                          }`}
                        >
                          <div>{slot.label}</div>
                          {slot.isBooked && <div className="text-[10px] text-rose-500">Booked</div>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Reason for Rescheduling <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Patient requested morning slot..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#007b92] text-foreground"
                />
              </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/10 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsRescheduleModalOpen(false)}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted text-foreground"
              >
                Cancel
              </button>
              <button
                disabled={isSubmittingMutation || !rescheduleDate || !rescheduleStartTime || !rescheduleReason.trim()}
                onClick={handleRescheduleSubmit}
                className="px-5 py-2 bg-[#007b92] text-white rounded-lg text-sm font-medium hover:bg-[#006072] transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmittingMutation ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>Confirm Reschedule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* PHASE 3: CANCEL APPOINTMENT MODAL */}
      {/* ========================================== */}
      {isCancelModalOpen && cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-rose-600 font-semibold">
                  Cancellation Prompt
                </span>
                <h3 className="text-lg font-bold text-foreground mt-0.5 font-mono">
                  Cancel {cancelTarget.appointmentNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {mutationError && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200 text-xs">
                  {mutationError}
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                Are you sure you want to cancel this appointment? This action will record an audit trail and publish an <code className="text-xs font-mono bg-muted p-1 rounded">AppointmentCancelledEvent</code>.
              </p>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Reason for Cancellation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Patient emergency, Doctor illness..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500 text-foreground"
                />
              </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/10 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted text-foreground"
              >
                Back
              </button>
              <button
                disabled={isSubmittingMutation || !cancelReason.trim()}
                onClick={handleCancelSubmit}
                className="px-5 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmittingMutation ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* PHASE 3: CONFIRM / COMPLETE / NO-SHOW CONFIRMATION PROMPTS */}
      {/* ========================================== */}
      {promptModal.isOpen && promptModal.appointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              {promptModal.type === 'CONFIRM' && (
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
              )}
              {promptModal.type === 'COMPLETE' && (
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              {promptModal.type === 'NO_SHOW' && (
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {promptModal.type === 'CONFIRM' && 'Confirm Appointment Booking'}
                  {promptModal.type === 'COMPLETE' && 'Complete Appointment Encounter'}
                  {promptModal.type === 'NO_SHOW' && 'Mark Patient as No-Show'}
                </h3>
                <span className="text-xs font-mono text-[#007b92]">
                  {promptModal.appointment.appointmentNumber}
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {promptModal.type === 'CONFIRM' &&
                'Confirm this scheduled appointment for the patient? This will update status to CONFIRMED and publish a confirmation event.'}
              {promptModal.type === 'COMPLETE' &&
                'Mark this appointment encounter as completed? This signifies the consultation has successfully concluded.'}
              {promptModal.type === 'NO_SHOW' &&
                'Mark this patient as No-Show? This indicates the patient did not report for their scheduled consultation.'}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPromptModal({ isOpen: false, type: null, appointment: null })}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted text-foreground"
              >
                Dismiss
              </button>

              {promptModal.type === 'CONFIRM' && (
                <button
                  type="button"
                  disabled={isSubmittingMutation}
                  onClick={() => executeConfirmAppointment(promptModal.appointment!)}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isSubmittingMutation ? 'Confirming...' : 'Yes, Confirm'}
                </button>
              )}

              {promptModal.type === 'COMPLETE' && (
                <button
                  type="button"
                  disabled={isSubmittingMutation}
                  onClick={() => executeCompleteAppointment(promptModal.appointment!)}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {isSubmittingMutation ? 'Updating...' : 'Yes, Complete'}
                </button>
              )}

              {promptModal.type === 'NO_SHOW' && (
                <button
                  type="button"
                  disabled={isSubmittingMutation}
                  onClick={() => executeNoShowAppointment(promptModal.appointment!)}
                  className="px-5 py-2 bg-slate-700 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {isSubmittingMutation ? 'Updating...' : 'Mark No-Show'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppointmentsAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-12 text-center text-muted-foreground text-sm space-y-3">
          <div className="w-8 h-8 border-2 border-[#007b92] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>Loading Appointment Directory...</p>
        </div>
      }
    >
      <AppointmentsContent />
    </Suspense>
  );
}
