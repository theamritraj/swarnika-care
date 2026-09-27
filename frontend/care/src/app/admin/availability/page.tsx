'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search, Plus, Clock, Stethoscope, Building2, Layers,
  Calendar, Trash2, CheckCircle2, AlertCircle, RefreshCw,
  X, Filter, ChevronRight, UserCheck, ShieldAlert
} from 'lucide-react';

interface AvailabilitySlot {
  id: number;
  doctorId: number;
  hospitalId: number;
  departmentId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface HospitalAssignment {
  id: number;
  doctorId: number;
  hospitalId: number;
  departmentId: number;
  designation?: string;
  status: string;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  specialization?: string;
  status?: string;
  assignments: HospitalAssignment[];
}

interface Hospital {
  id: number;
  name: string;
  code: string;
}

interface Department {
  id: number;
  hospitalId: number;
  name: string;
  code: string;
}

const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
];

function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const paddedHours = hours < 10 ? `0${hours}` : hours;
  return `${paddedHours}:${minutes} ${ampm}`;
}

function calculateDuration(startStr: string, endStr: string): string {
  if (!startStr || !endStr) return '';
  const [sH, sM] = startStr.split(':').map(Number);
  const [eH, eM] = endStr.split(':').map(Number);
  let totalMin = (eH * 60 + (eM || 0)) - (sH * 60 + (sM || 0));
  if (totalMin <= 0) return '';
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours} hrs`;
  return `${mins} mins`;
}

function AvailabilityContent() {
  const searchParams = useSearchParams();
  const initialDoctorId = searchParams.get('doctorId');
  const initialHospitalId = searchParams.get('hospitalId');
  const initialDeptId = searchParams.get('departmentId');

  // Core Data
  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<string>(initialHospitalId || 'all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(initialDeptId || 'all');
  const [selectedDoctor, setSelectedDoctor] = useState<string>(initialDoctorId || 'all');
  const [selectedDay, setSelectedDay] = useState<string>('all');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Add Schedule Form
  const [formData, setFormData] = useState({
    doctorId: initialDoctorId || '',
    hospitalId: initialHospitalId || '',
    departmentId: initialDeptId || '',
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '13:00'
  });

  // Load lookup data (Hospitals, Departments, Doctors Directory)
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [hospRes, deptRes, docRes] = await Promise.all([
          fetch('/api/proxy/api/v1/hospitals'),
          fetch('/api/proxy/api/v1/departments'),
          fetch('/api/proxy/api/v1/doctors/directory')
        ]);
        if (hospRes.ok) {
          const hospData = await hospRes.json();
          setHospitals(hospData.data || []);
        }
        if (deptRes.ok) {
          const deptData = await deptRes.json();
          setDepartments(deptData.data || []);
        }
        if (docRes.ok) {
          const docData = await docRes.json();
          setDoctors(docData.data || []);
        }
      } catch (err) {
        console.error('Failed to load metadata', err);
      }
    }
    loadMetadata();
  }, []);

  // Fetch Schedules from backend
  async function loadAvailabilities(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      let url = '/api/proxy/api/v1/doctors/availability';
      const params = new URLSearchParams();
      if (selectedHospital && selectedHospital !== 'all') {
        params.append('hospitalId', selectedHospital);
      }
      if (selectedDepartment && selectedDepartment !== 'all') {
        params.append('departmentId', selectedDepartment);
      }
      if (selectedDoctor && selectedDoctor !== 'all') {
        params.append('doctorId', selectedDoctor);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `Failed to fetch availability (HTTP ${res.status})`);
      }
      const json = await res.json();
      setAvailabilities(json.data || []);
    } catch (err: any) {
      console.error('Error fetching availabilities:', err);
      setError(err.message || 'Failed to load doctor schedules');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Reload when hospital/department/doctor filters change
  useEffect(() => {
    loadAvailabilities();
  }, [selectedHospital, selectedDepartment, selectedDoctor]);

  // Auto-clear success banner
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Lookup Maps
  const hospitalMap = useMemo(() => {
    const map = new Map<number, string>();
    hospitals.forEach(h => map.set(h.id, h.name));
    return map;
  }, [hospitals]);

  const departmentMap = useMemo(() => {
    const map = new Map<number, string>();
    departments.forEach(d => map.set(d.id, d.name));
    return map;
  }, [departments]);

  const doctorMap = useMemo(() => {
    const map = new Map<number, Doctor>();
    doctors.forEach(d => map.set(d.id, d));
    return map;
  }, [doctors]);

  // Available departments for selected hospital filter
  const filteredDepartments = useMemo(() => {
    if (!selectedHospital || selectedHospital === 'all') return departments;
    const hId = parseInt(selectedHospital);
    return departments.filter(d => d.hospitalId === hId);
  }, [selectedHospital, departments]);

  // Filtered availability slots
  const filteredSlots = useMemo(() => {
    return availabilities.filter(slot => {
      // Day filter
      if (selectedDay !== 'all' && slot.dayOfWeek !== selectedDay) {
        return false;
      }

      // Search query (doctor name, DOC ID, specialization)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const doc = doctorMap.get(slot.doctorId);
        const docName = doc ? `${doc.firstName} ${doc.lastName}`.toLowerCase() : '';
        const docIdStr = `doc-${slot.doctorId}`.toLowerCase();
        const docSpec = (doc?.specialization || '').toLowerCase();
        const matchesQuery = docName.includes(q) || docIdStr.includes(q) || docSpec.includes(q);
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [availabilities, selectedDay, searchQuery, doctorMap]);

  // --- Modal Form Dynamic Validation & Dependency Tracking ---
  
  // Available hospitals for chosen doctor in modal
  const formDoctor = useMemo(() => {
    if (!formData.doctorId) return null;
    return doctorMap.get(parseInt(formData.doctorId)) || null;
  }, [formData.doctorId, doctorMap]);

  // Permitted hospitals for chosen doctor
  const modalDoctorHospitals = useMemo(() => {
    if (!formDoctor) return hospitals;
    const assignedHospIds = new Set(formDoctor.assignments.map(a => a.hospitalId));
    return hospitals.filter(h => assignedHospIds.has(h.id));
  }, [formDoctor, hospitals]);

  // Permitted departments for chosen hospital and doctor in modal
  const modalDoctorDepartments = useMemo(() => {
    if (!formData.hospitalId) return [];
    const hId = parseInt(formData.hospitalId);
    if (!formDoctor) {
      return departments.filter(d => d.hospitalId === hId);
    }
    const assignedDeptIds = new Set(
      formDoctor.assignments
        .filter(a => a.hospitalId === hId)
        .map(a => a.departmentId)
    );
    return departments.filter(d => d.hospitalId === hId && assignedDeptIds.has(d.id));
  }, [formData.hospitalId, formDoctor, departments]);

  // Available doctors if hospital and department are selected first
  const eligibleDoctors = useMemo(() => {
    if (!formData.hospitalId) return doctors;
    const hId = parseInt(formData.hospitalId);
    const dId = formData.departmentId ? parseInt(formData.departmentId) : null;

    return doctors.filter(doc => {
      return doc.assignments.some(a => {
        if (a.hospitalId !== hId) return false;
        if (dId && a.departmentId !== dId) return false;
        return true;
      });
    });
  }, [formData.hospitalId, formData.departmentId, doctors]);

  // Time validation
  const timeError = useMemo(() => {
    if (!formData.startTime || !formData.endTime) return null;
    if (formData.startTime >= formData.endTime) {
      return 'Start time must be strictly before End time.';
    }
    return null;
  }, [formData.startTime, formData.endTime]);

  // --- Handlers ---

  async function handleAddSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (timeError) {
      setError(timeError);
      return;
    }
    if (!formData.doctorId || !formData.hospitalId || !formData.departmentId) {
      setError('Please select Doctor, Hospital, and Department.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const docId = parseInt(formData.doctorId);
      const payload = {
        hospitalId: parseInt(formData.hospitalId),
        departmentId: parseInt(formData.departmentId),
        dayOfWeek: formData.dayOfWeek,
        startTime: `${formData.startTime}:00`,
        endTime: `${formData.endTime}:00`
      };

      const res = await fetch(`/api/proxy/api/v1/doctors/${docId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        setError(errJson?.message || 'Failed to add doctor availability schedule');
        return;
      }

      setSuccess(`Availability slot added successfully for ${formData.dayOfWeek}!`);
      setIsAddModalOpen(false);
      // Reset time fields but keep selections
      setFormData(prev => ({
        ...prev,
        startTime: '09:00',
        endTime: '13:00'
      }));
      loadAvailabilities(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to add schedule');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSchedule(slotId: number) {
    setError(null);
    try {
      const res = await fetch(`/api/proxy/api/v1/doctors/availability/${slotId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || 'Failed to delete availability slot');
      }

      setSuccess('Availability slot removed successfully!');
      setDeleteConfirmId(null);
      loadAvailabilities(true);
    } catch (err: any) {
      console.error('Delete slot failed:', err);
      setError(err.message || 'Failed to remove schedule');
    }
  }

  // Day Badge Styling Helper
  function getDayBadgeClass(day: string) {
    switch (day) {
      case 'MONDAY':
      case 'TUESDAY':
      case 'WEDNESDAY':
      case 'THURSDAY':
      case 'FRIDAY':
        return 'bg-[#007b92]/10 text-[#007b92] border-[#007b92]/20';
      case 'SATURDAY':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'SUNDAY':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/admin/doctors" className="hover:text-card-foreground transition">Doctors</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#007b92] font-medium">Availability & Schedules</span>
          </div>
          <h1 className="text-2xl font-bold text-card-foreground">Doctor Availability & Schedules</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Configure weekly OPD consulting schedules, time slots, and hospital-department deployments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadAvailabilities(true)}
            disabled={refreshing}
            className="p-2 border border-border rounded-lg hover:bg-background text-muted-foreground transition"
            title="Refresh Schedules"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setIsAddModalOpen(true);
              setError(null);
            }}
            className="bg-[#007b92] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#006072] transition flex items-center gap-2 shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" /> Add Schedule Slot
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="text-xs font-medium text-muted-foreground">Total Active Slots</div>
          <div className="text-2xl font-bold text-card-foreground mt-1">{availabilities.length}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Weekly consult sessions</div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="text-xs font-medium text-muted-foreground">Doctors on Schedule</div>
          <div className="text-2xl font-bold text-card-foreground mt-1">
            {new Set(availabilities.map(a => a.doctorId)).size}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Active practitioners</div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="text-xs font-medium text-muted-foreground">Hospitals Covered</div>
          <div className="text-2xl font-bold text-card-foreground mt-1">
            {new Set(availabilities.map(a => a.hospitalId)).size}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Clinical locations</div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="text-xs font-medium text-muted-foreground">Weekend Coverage</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {availabilities.filter(a => a.dayOfWeek === 'SATURDAY' || a.dayOfWeek === 'SUNDAY').length} Slots
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Saturday & Sunday OPD</div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-500/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="p-1 hover:bg-emerald-500/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor name or DOC ID..." 
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] focus:bg-card transition-all"
          />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto">
          {/* Hospital Filter */}
          <select 
            value={selectedHospital}
            onChange={(e) => {
              setSelectedHospital(e.target.value);
              setSelectedDepartment('all'); // Reset dept when hospital changes
            }}
            className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92]"
          >
            <option value="all">All Hospitals</option>
            {hospitals.map(h => (
              <option key={h.id} value={h.id.toString()}>{h.name}</option>
            ))}
          </select>

          {/* Department Filter */}
          <select 
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92]"
          >
            <option value="all">All Departments</option>
            {filteredDepartments.map(d => (
              <option key={d.id} value={d.id.toString()}>{d.name}</option>
            ))}
          </select>

          {/* Doctor Filter */}
          <select 
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92] max-w-[200px]"
          >
            <option value="all">All Doctors</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id.toString()}>Dr. {d.firstName} {d.lastName}</option>
            ))}
          </select>

          {/* Day of Week Filter */}
          <select 
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92]"
          >
            <option value="all">All Days</option>
            {DAYS_OF_WEEK.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(selectedHospital !== 'all' || selectedDepartment !== 'all' || selectedDoctor !== 'all' || selectedDay !== 'all' || searchQuery) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <Filter className="w-3.5 h-3.5" />
          <span>Active Filters:</span>
          {selectedHospital !== 'all' && (
            <span className="bg-accent/50 px-2 py-0.5 rounded-full flex items-center gap-1">
              Hospital: {hospitalMap.get(parseInt(selectedHospital)) || selectedHospital}
              <button onClick={() => setSelectedHospital('all')}><X className="w-3 h-3 hover:text-card-foreground" /></button>
            </span>
          )}
          {selectedDepartment !== 'all' && (
            <span className="bg-accent/50 px-2 py-0.5 rounded-full flex items-center gap-1">
              Dept: {departmentMap.get(parseInt(selectedDepartment)) || selectedDepartment}
              <button onClick={() => setSelectedDepartment('all')}><X className="w-3 h-3 hover:text-card-foreground" /></button>
            </span>
          )}
          {selectedDoctor !== 'all' && (
            <span className="bg-accent/50 px-2 py-0.5 rounded-full flex items-center gap-1">
              Doctor: {doctorMap.get(parseInt(selectedDoctor)) ? `Dr. ${doctorMap.get(parseInt(selectedDoctor))?.firstName} ${doctorMap.get(parseInt(selectedDoctor))?.lastName}` : selectedDoctor}
              <button onClick={() => setSelectedDoctor('all')}><X className="w-3 h-3 hover:text-card-foreground" /></button>
            </span>
          )}
          {selectedDay !== 'all' && (
            <span className="bg-accent/50 px-2 py-0.5 rounded-full flex items-center gap-1">
              Day: {selectedDay}
              <button onClick={() => setSelectedDay('all')}><X className="w-3 h-3 hover:text-card-foreground" /></button>
            </span>
          )}
          <button
            onClick={() => {
              setSelectedHospital('all');
              setSelectedDepartment('all');
              setSelectedDoctor('all');
              setSelectedDay('all');
              setSearchQuery('');
            }}
            className="text-[#007b92] hover:underline font-medium ml-2"
          >
            Reset all
          </button>
        </div>
      )}

      {/* Schedules Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted/40 rounded-full"></div>
                  <div className="space-y-1.5">
                    <div className="w-36 h-4 bg-muted/40 rounded"></div>
                    <div className="w-24 h-3 bg-muted/30 rounded"></div>
                  </div>
                </div>
                <div className="w-32 h-4 bg-muted/40 rounded"></div>
                <div className="w-28 h-4 bg-muted/40 rounded"></div>
                <div className="w-36 h-4 bg-muted/40 rounded"></div>
                <div className="w-16 h-4 bg-muted/40 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-accent/40 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-card-foreground">No availability schedules found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {searchQuery || selectedHospital !== 'all' || selectedDepartment !== 'all' || selectedDoctor !== 'all' || selectedDay !== 'all'
                ? 'No schedules match your selected filters. Try clearing some criteria.'
                : 'No doctor schedules are currently configured. Click "Add Schedule Slot" to establish clinic consulting hours.'}
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSelectedHospital('all');
                  setSelectedDepartment('all');
                  setSelectedDoctor('all');
                  setSelectedDay('all');
                  setSearchQuery('');
                  setIsAddModalOpen(true);
                }}
                className="bg-[#007b92] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#006072] transition text-sm inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add First Schedule
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-background border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Doctor</th>
                  <th className="px-6 py-3 font-medium">Hospital & Department</th>
                  <th className="px-6 py-3 font-medium">Day of Week</th>
                  <th className="px-6 py-3 font-medium">Shift Timing & Duration</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredSlots.map(slot => {
                  const doc = doctorMap.get(slot.doctorId);
                  const hospName = hospitalMap.get(slot.hospitalId) || `Hospital ${slot.hospitalId}`;
                  const deptName = departmentMap.get(slot.departmentId) || `Dept ${slot.departmentId}`;
                  const duration = calculateDuration(slot.startTime, slot.endTime);

                  return (
                    <tr key={slot.id} className="hover:bg-background transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/50 flex items-center justify-center flex-shrink-0 text-[#007b92]">
                            <Stethoscope className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-card-foreground">
                              {doc ? `Dr. ${doc.firstName} ${doc.lastName}` : `Doctor ID ${slot.doctorId}`}
                            </div>
                            <div className="text-muted-foreground text-xs flex items-center gap-2">
                              <span>DOC-{slot.doctorId}</span>
                              {doc?.specialization && <span>• {doc.specialization}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-medium text-card-foreground text-xs">
                            <Building2 className="w-3.5 h-3.5 text-[#007b92] flex-shrink-0" />
                            <span>{hospName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                            <Layers className="w-3.5 h-3.5 text-muted-foreground/70 flex-shrink-0" />
                            <span>{deptName}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getDayBadgeClass(slot.dayOfWeek)}`}>
                          <Calendar className="w-3 h-3 mr-1.5" />
                          {slot.dayOfWeek}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-card-foreground font-medium">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{formatTime(slot.startTime)} – {formatTime(slot.endTime)}</span>
                          </div>
                          {duration && (
                            <span className="text-[11px] bg-accent/40 text-muted-foreground px-1.5 py-0.5 rounded">
                              {duration}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-500"></span>
                          {slot.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {deleteConfirmId === slot.id ? (
                          <div className="inline-flex items-center gap-1">
                            <span className="text-xs text-red-500 font-medium mr-1">Remove?</span>
                            <button
                              onClick={() => handleDeleteSchedule(slot.id)}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 text-xs bg-card border border-border rounded hover:bg-background transition"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(slot.id)}
                            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                            title="Delete Schedule"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* MODAL: ADD AVAILABILITY SCHEDULE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl shadow-xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-card-foreground">Add Doctor Availability</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure clinical consultation time slots for assigned hospital departments
                </p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="p-1 rounded-lg text-muted-foreground hover:bg-background transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="p-6 space-y-5">
              
              {/* Modal Inline Error */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{error}</span>
                  </div>
                  <button type="button" onClick={() => setError(null)} className="p-1 hover:bg-red-500/20 rounded">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Step 1: Doctor Selection */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  1. Doctor *
                </label>
                <select
                  required
                  value={formData.doctorId}
                  onChange={e => {
                    const newDocId = e.target.value;
                    const doc = doctorMap.get(parseInt(newDocId));
                    let nextHospId = formData.hospitalId;
                    let nextDeptId = formData.departmentId;

                    // If doc has assignments and current hospital is invalid for them, auto-select first assigned hospital
                    if (doc && doc.assignments.length > 0) {
                      const hasCurrentHosp = doc.assignments.some(a => a.hospitalId.toString() === nextHospId);
                      if (!hasCurrentHosp) {
                        nextHospId = doc.assignments[0].hospitalId.toString();
                        nextDeptId = doc.assignments[0].departmentId.toString();
                      }
                    }

                    setFormData({
                      ...formData,
                      doctorId: newDocId,
                      hospitalId: nextHospId,
                      departmentId: nextDeptId
                    });
                  }}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                >
                  <option value="">Select Doctor</option>
                  {eligibleDoctors.map(d => (
                    <option key={d.id} value={d.id.toString()}>
                      Dr. {d.firstName} {d.lastName} {d.specialization ? `(${d.specialization})` : ''} — DOC-{d.id}
                    </option>
                  ))}
                </select>

                {formDoctor && formDoctor.assignments.length === 0 && (
                  <div className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>This doctor is not assigned to any hospital yet. You must assign them to a hospital first.</span>
                  </div>
                )}
              </div>

              {/* Step 2: Hospital & Department Hierarchy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    2. Hospital *
                  </label>
                  <select
                    required
                    value={formData.hospitalId}
                    onChange={e => {
                      const newHospId = e.target.value;
                      setFormData({
                        ...formData,
                        hospitalId: newHospId,
                        departmentId: '' // reset department
                      });
                    }}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                  >
                    <option value="">Select Hospital</option>
                    {modalDoctorHospitals.map(h => (
                      <option key={h.id} value={h.id.toString()}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    3. Department *
                  </label>
                  <select
                    required
                    disabled={!formData.hospitalId}
                    value={formData.departmentId}
                    onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] disabled:opacity-50"
                  >
                    <option value="">Select Department</option>
                    {modalDoctorDepartments.map(d => (
                      <option key={d.id} value={d.id.toString()}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 3: Day of Week */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  4. Day of Week *
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setFormData({ ...formData, dayOfWeek: day })}
                      className={`py-2 text-xs font-semibold rounded-lg border transition text-center ${
                        formData.dayOfWeek === day
                          ? 'bg-[#007b92] text-white border-[#007b92] shadow-sm'
                          : 'bg-background border-border text-muted-foreground hover:bg-card'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Shift Timings */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  5. Shift Timing *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">Start Time</label>
                    <input 
                      type="time" 
                      required
                      value={formData.startTime}
                      onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">End Time</label>
                    <input 
                      type="time" 
                      required
                      value={formData.endTime}
                      onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                    />
                  </div>
                </div>

                {/* Duration or Time Error */}
                {timeError ? (
                  <div className="mt-2 text-xs text-red-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{timeError}</span>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#007b92]" />
                    <span>Calculated duration: <strong className="text-card-foreground">{calculateDuration(formData.startTime, formData.endTime)}</strong></span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-background transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || Boolean(timeError) || !formData.doctorId || !formData.hospitalId || !formData.departmentId}
                  className="bg-[#007b92] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#006072] transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Save Schedule Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AvailabilityAdminPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto p-8 space-y-4">
        <div className="w-48 h-8 bg-muted/40 animate-pulse rounded"></div>
        <div className="w-full h-96 bg-muted/20 animate-pulse rounded-xl"></div>
      </div>
    }>
      <AvailabilityContent />
    </Suspense>
  );
}
