'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search, Plus, Users, UserPlus, FileText, Building2,
  Calendar, Phone, Mail, Heart, AlertCircle, CheckCircle2,
  X, Edit2, Eye, RefreshCw, Filter, Sparkles, Share2, Link2,
  MoreVertical, ShieldCheck, MapPin, Activity, Trash2, ChevronRight
} from 'lucide-react';

export interface PatientHospitalRegistration {
  id: number;
  patientId: number;
  hospitalId: number;
  hospitalName?: string;
  registrationNumber: string;
  registrationDate: string;
  status: string;
}

export interface PatientRelationship {
  id: number;
  sourcePatientId: number;
  targetPatientId: number;
  relationshipType: string;
  notes?: string;
  targetPatientFirstName?: string;
  targetPatientLastName?: string;
  targetPatientMrn?: string;
}

export interface Patient {
  id: number;
  mrn: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  emergencyContact?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DECEASED' | 'SUSPENDED';
  createdAt?: string;
  updatedAt?: string;
  registrations?: PatientHospitalRegistration[];
  relationships?: PatientRelationship[];
}

interface Hospital {
  id: number;
  name: string;
  code: string;
}

const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const RELATIONSHIP_TYPES = [
  { value: 'MOTHER_OF', label: 'Mother of' },
  { value: 'FATHER_OF', label: 'Father of' },
  { value: 'CHILD_OF', label: 'Child of' },
  { value: 'SPOUSE_OF', label: 'Spouse of' },
  { value: 'SIBLING_OF', label: 'Sibling of' },
  { value: 'GUARDIAN_OF', label: 'Guardian of' },
];

function calculateAge(dateOfBirth?: string): string {
  if (!dateOfBirth) return 'Age unknown';
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return '';
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  const years = Math.abs(ageDate.getUTCFullYear() - 1970);
  return `${years} yrs`;
}

function PatientsContent() {
  const searchParams = useSearchParams();
  const initialHospitalId = searchParams.get('hospitalId');

  // Core Data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<string>(initialHospitalId || 'all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals & Drawers
  const [activeModal, setActiveModal] = useState<'register' | 'view' | 'edit' | 'add-reg' | 'add-rel' | null>(null);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [activePatientRegistrations, setActivePatientRegistrations] = useState<PatientHospitalRegistration[]>([]);
  const [activePatientRelationships, setActivePatientRelationships] = useState<PatientRelationship[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'relationships'>('overview');

  // Registration Form State
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: 'O+',
    address: '',
    emergencyContact: '',
    hospitalId: '',
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: 'O+',
    address: '',
    emergencyContact: '',
    status: 'ACTIVE',
  });

  // New Hospital Registration State
  const [newRegForm, setNewRegForm] = useState({
    hospitalId: '',
    registrationDate: new Date().toISOString().split('T')[0],
  });

  // New Family Relationship State
  const [newRelForm, setNewRelForm] = useState({
    targetPatientId: '',
    relationshipType: 'MOTHER_OF',
    notes: '',
  });

  // Load Hospitals Lookup
  useEffect(() => {
    async function loadHospitals() {
      try {
        const res = await fetch('/api/proxy/api/v1/hospitals');
        if (res.ok) {
          const json = await res.json();
          setHospitals(json.data || json || []);
        }
      } catch (err) {
        console.error('Failed to load hospitals', err);
      }
    }
    loadHospitals();
  }, []);

  // Fetch Patients
  async function loadPatients(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/proxy/api/v1/patients');
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `Failed to fetch patients (HTTP ${res.status})`);
      }
      const json = await res.json();
      setPatients(json.data || json || []);
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError(err.message || 'Failed to load patient records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  // Fetch Single Patient Details (Registrations & Family Links)
  async function loadPatientDetails(patient: Patient) {
    setActivePatient(patient);
    setLoadingDetails(true);
    try {
      const [regRes, relRes] = await Promise.all([
        fetch(`/api/proxy/api/v1/patients/${patient.id}/registrations`),
        fetch(`/api/proxy/api/v1/patients/${patient.id}/relationships`)
      ]);

      if (regRes.ok) {
        const regJson = await regRes.json();
        setActivePatientRegistrations(regJson.data || regJson || []);
      } else {
        setActivePatientRegistrations([]);
      }

      if (relRes.ok) {
        const relJson = await relRes.json();
        setActivePatientRelationships(relJson.data || relJson || []);
      } else {
        setActivePatientRelationships([]);
      }
    } catch (err) {
      console.error('Error loading patient sub-resources:', err);
    } finally {
      setLoadingDetails(false);
    }
  }

  // Open Register Modal
  const openRegisterModal = () => {
    setRegisterForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'MALE',
      bloodGroup: 'O+',
      address: '',
      emergencyContact: '',
      hospitalId: selectedHospital !== 'all' ? selectedHospital : (hospitals[0]?.id?.toString() || ''),
    });
    setError(null);
    setActiveModal('register');
  };

  // Open View Modal
  const openViewModal = (patient: Patient) => {
    setActiveTab('overview');
    loadPatientDetails(patient);
    setActiveModal('view');
  };

  // Open Edit Modal
  const openEditModal = (patient: Patient) => {
    setActivePatient(patient);
    setEditForm({
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      email: patient.email || '',
      phone: patient.phone || '',
      dateOfBirth: patient.dateOfBirth || '',
      gender: patient.gender || 'MALE',
      bloodGroup: patient.bloodGroup || 'O+',
      address: patient.address || '',
      emergencyContact: patient.emergencyContact || '',
      status: patient.status || 'ACTIVE',
    });
    setActiveModal('edit');
  };

  // Submit: Register Patient
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!registerForm.firstName.trim() || !registerForm.lastName.trim()) {
        throw new Error('First and last name are required.');
      }
      if (!registerForm.email.trim() || !registerForm.phone.trim()) {
        throw new Error('Email and phone are required.');
      }

      const payload = {
        firstName: registerForm.firstName.trim(),
        lastName: registerForm.lastName.trim(),
        email: registerForm.email.trim(),
        phone: registerForm.phone.trim(),
        dateOfBirth: registerForm.dateOfBirth || null,
        gender: registerForm.gender,
        bloodGroup: registerForm.bloodGroup || null,
        address: registerForm.address.trim() || null,
        emergencyContact: registerForm.emergencyContact.trim() || null,
        hospitalId: registerForm.hospitalId ? Number(registerForm.hospitalId) : null,
      };

      const res = await fetch('/api/proxy/api/v1/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Patient registration failed (HTTP ${res.status})`);
      }

      const created = json.data || json;
      setSuccess(`Patient ${created.firstName} ${created.lastName} registered successfully with MRN: ${created.mrn}!`);
      setTimeout(() => setSuccess(null), 6000);
      setActiveModal(null);
      loadPatients(true);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register patient');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit: Edit Patient
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        dateOfBirth: editForm.dateOfBirth || null,
        gender: editForm.gender,
        bloodGroup: editForm.bloodGroup || null,
        address: editForm.address.trim() || null,
        emergencyContact: editForm.emergencyContact.trim() || null,
        status: editForm.status,
      };

      const res = await fetch(`/api/proxy/api/v1/patients/${activePatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Update failed (HTTP ${res.status})`);
      }

      setSuccess(`Patient ${activePatient.mrn} details updated successfully.`);
      setTimeout(() => setSuccess(null), 5000);
      setActiveModal(null);
      loadPatients(true);
    } catch (err: any) {
      console.error('Edit error:', err);
      setError(err.message || 'Failed to update patient');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit: Add Hospital Registration
  const handleAddHospitalReg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient || !newRegForm.hospitalId) return;
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        hospitalId: Number(newRegForm.hospitalId),
        registrationDate: newRegForm.registrationDate || new Date().toISOString().split('T')[0],
      };

      const res = await fetch(`/api/proxy/api/v1/patients/${activePatient.id}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Hospital registration failed (HTTP ${res.status})`);
      }

      setSuccess(`Registered patient ${activePatient.mrn} to hospital!`);
      setTimeout(() => setSuccess(null), 5000);
      setActiveModal('view');
      loadPatientDetails(activePatient);
    } catch (err: any) {
      console.error('Hospital registration error:', err);
      setError(err.message || 'Failed to register at hospital');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit: Add Family Relationship
  const handleAddRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient || !newRelForm.targetPatientId) return;
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        targetPatientId: Number(newRelForm.targetPatientId),
        relationshipType: newRelForm.relationshipType,
        notes: newRelForm.notes.trim() || null,
      };

      const res = await fetch(`/api/proxy/api/v1/patients/${activePatient.id}/relationships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Failed to create relationship (HTTP ${res.status})`);
      }

      setSuccess(`Family relationship created successfully.`);
      setTimeout(() => setSuccess(null), 5000);
      setActiveModal('view');
      loadPatientDetails(activePatient);
    } catch (err: any) {
      console.error('Relationship error:', err);
      setError(err.message || 'Failed to create relationship');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Relationship
  const handleDeleteRelationship = async (relId: number) => {
    if (!activePatient) return;
    try {
      const res = await fetch(`/api/proxy/api/v1/patients/${activePatient.id}/relationships/${relId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSuccess('Relationship unlinked successfully.');
        setTimeout(() => setSuccess(null), 4000);
        loadPatientDetails(activePatient);
      }
    } catch (err) {
      console.error('Failed to delete relationship', err);
    }
  };

  // Filtered Patient List
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      // Search query filter (MRN, name, email, phone)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = `${p.firstName} ${p.lastName}`.toLowerCase().includes(q);
        const matchesMrn = p.mrn?.toLowerCase().includes(q);
        const matchesEmail = p.email?.toLowerCase().includes(q);
        const matchesPhone = p.phone?.toLowerCase().includes(q);
        if (!matchesName && !matchesMrn && !matchesEmail && !matchesPhone) {
          return false;
        }
      }

      // Gender filter
      if (selectedGender !== 'all' && p.gender !== selectedGender) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && p.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [patients, searchQuery, selectedGender, selectedStatus]);

  // KPI Calculations
  const metrics = useMemo(() => {
    const total = patients.length;
    const active = patients.filter((p) => p.status === 'ACTIVE').length;
    const males = patients.filter((p) => p.gender === 'MALE').length;
    const females = patients.filter((p) => p.gender === 'FEMALE').length;
    const withBloodGroup = patients.filter((p) => p.bloodGroup).length;
    return { total, active, males, females, withBloodGroup };
  }, [patients]);

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
          Active
        </span>
      );
    }
    if (status === 'INACTIVE') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400">
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-1.5"></span>
          Inactive
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300">
        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-1.5"></span>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Toast Feedback */}
      {success && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-sm font-medium">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-100 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800 dark:hover:text-rose-100 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Navigation & Live KPI Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#007b92]">
            <Users className="w-4 h-4" />
            <span>Master Patient Index (MPI)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-card-foreground mt-1">Patient Directory</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage patient demographic records, Medical Record Numbers (MRN), multi-hospital registrations, and family relationships.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadPatients(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground bg-card hover:bg-muted transition shadow-sm disabled:opacity-50"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={openRegisterModal}
            className="bg-[#007b92] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#006072] transition flex items-center gap-2 shadow-sm text-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-card p-3 rounded-xl border border-border shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-muted-foreground">Total Patients</span>
          <span className="text-2xl font-bold text-foreground mt-1">{metrics.total}</span>
        </div>
        <div className="bg-card p-3 rounded-xl border border-border shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{metrics.active}</span>
        </div>
        <div className="bg-card p-3 rounded-xl border border-border shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-muted-foreground">Male Patients</span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{metrics.males}</span>
        </div>
        <div className="bg-card p-3 rounded-xl border border-border shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-muted-foreground">Female Patients</span>
          <span className="text-2xl font-bold text-pink-600 dark:text-pink-400 mt-1">{metrics.females}</span>
        </div>
        <div className="bg-card p-3 rounded-xl border border-border shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-muted-foreground">Blood Profile Recorded</span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{metrics.withBloodGroup}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by MRN, name, phone, or email..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] focus:bg-card transition-all placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Quick Dropdown Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-wrap">
            {/* Hospital Selector */}
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="bg-background border border-border text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92] text-foreground"
            >
              <option value="all">All Hospitals</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id.toString()}>{h.name}</option>
              ))}
            </select>

            {/* Gender Filter */}
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="bg-background border border-border text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92] text-foreground font-medium"
            >
              <option value="all">All Genders</option>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-background border border-border text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92] text-foreground"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        {/* Active Filter Pills */}
        {(selectedHospital !== 'all' || selectedGender !== 'all' || selectedStatus !== 'all' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40 text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <Filter className="w-3 h-3" /> Active Filters:
            </span>
            {selectedHospital !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">
                Hospital: {hospitals.find((h) => h.id.toString() === selectedHospital)?.name || selectedHospital}
                <button onClick={() => setSelectedHospital('all')} className="hover:text-rose-500"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedGender !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">
                Gender: {selectedGender}
                <button onClick={() => setSelectedGender('all')} className="hover:text-rose-500"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">
                Status: {selectedStatus}
                <button onClick={() => setSelectedStatus('all')} className="hover:text-rose-500"><X className="w-3 h-3" /></button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-rose-500"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedHospital('all');
                setSelectedGender('all');
                setSelectedStatus('all');
                setSearchQuery('');
              }}
              className="text-[#007b92] hover:underline font-medium ml-2"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Main Patient Directory Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 bg-muted/50 animate-pulse rounded-lg w-full"></div>
              ))}
            </div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="py-16 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/30 text-[#007b92] flex items-center justify-center mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">No patient records found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedHospital !== 'all' || selectedGender !== 'all' || searchQuery
                  ? 'No patient records match your active search or filter criteria. Try clearing filters.'
                  : 'Start by registering your first patient to generate an MRN and create hospital registration.'}
              </p>
            </div>
            <button
              onClick={openRegisterModal}
              className="bg-[#007b92] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#006072] transition text-sm inline-flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Register New Patient
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">MRN & System ID</th>
                  <th className="px-6 py-3.5">Patient Name & Demographics</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5">Blood Group & Address</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-muted/30 transition-colors">
                    {/* MRN & ID */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#007b92] flex items-center justify-center font-bold text-xs shrink-0 border border-teal-200/50 dark:border-teal-800 font-mono">
                          {patient.mrn ? patient.mrn.slice(-4) : `#${patient.id}`}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground font-mono text-xs flex items-center gap-1.5">
                            <span className="text-[#007b92]">{patient.mrn || 'NO-MRN'}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            ID: #{patient.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Name & Demographics */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-foreground">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-muted-foreground text-xs flex items-center gap-2 mt-0.5">
                          {patient.gender && (
                            <span className="capitalize">{patient.gender.toLowerCase()}</span>
                          )}
                          {patient.dateOfBirth && (
                            <span>• {calculateAge(patient.dateOfBirth)}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5 text-xs">
                        <div className="text-foreground flex items-center gap-1.5 font-medium">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span>{patient.phone}</span>
                        </div>
                        <div className="text-muted-foreground flex items-center gap-1.5">
                          <Mail className="w-3 h-3" />
                          <span>{patient.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Blood Group & Address */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {patient.bloodGroup ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                            {patient.bloodGroup}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">Blood group not set</span>
                        )}
                        {patient.address && (
                          <div className="text-muted-foreground text-[11px] max-w-xs truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{patient.address}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {getStatusBadge(patient.status)}
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openViewModal(patient)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                          title="View Patient Profile & Relationships"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(patient)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                          title="Edit Patient Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL 1: Register New Patient --- */}
      {activeModal === 'register' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#007b92]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Register New Patient</h2>
                  <p className="text-xs text-muted-foreground">Generates a unique MRN and registers demographic profile into the MPI database.</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">First Name *</label>
                  <input
                    type="text"
                    required
                    value={registerForm.firstName}
                    onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                    placeholder="e.g. Ramesh"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                    placeholder="e.g. Sharma"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#007b92]" /> Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="e.g. ramesh.sharma@gmail.com"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#007b92]" /> Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#007b92]" /> Date of Birth
                  </label>
                  <input
                    type="date"
                    value={registerForm.dateOfBirth}
                    onChange={(e) => setRegisterForm({ ...registerForm, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Gender *</label>
                  <select
                    value={registerForm.gender}
                    onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  >
                    {GENDERS.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>

                {/* Blood Group */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" /> Blood Group
                  </label>
                  <select
                    value={registerForm.bloodGroup}
                    onChange={(e) => setRegisterForm({ ...registerForm, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                {/* Primary Hospital Deployment */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#007b92]" /> Primary Hospital Registration
                  </label>
                  <select
                    value={registerForm.hospitalId}
                    onChange={(e) => setRegisterForm({ ...registerForm, hospitalId: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  >
                    <option value="">None (Global Registration Only)</option>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id.toString()}>{h.name}</option>
                    ))}
                  </select>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">Emergency Contact Details</label>
                  <input
                    type="text"
                    value={registerForm.emergencyContact}
                    onChange={(e) => setRegisterForm({ ...registerForm, emergencyContact: e.target.value })}
                    placeholder="e.g. Suman Sharma (Spouse) - +91 9876543211"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>

                {/* Residential Address */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">Residential Address</label>
                  <textarea
                    rows={2}
                    value={registerForm.address}
                    onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                    placeholder="Street address, city, state, postal code"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted text-foreground transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#007b92] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#006072] transition disabled:opacity-50 flex items-center gap-2 shadow-xs"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <span>Register Patient</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: Patient Details Drawer / View Modal --- */}
      {activeModal === 'view' && activePatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#007b92] flex items-center justify-center font-bold text-sm border border-teal-200/50 dark:border-teal-800 font-mono">
                  {activePatient.mrn ? activePatient.mrn.slice(-4) : `#${activePatient.id}`}
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span>{activePatient.firstName} {activePatient.lastName}</span>
                    <span className="font-mono text-xs text-[#007b92] bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                      {activePatient.mrn}
                    </span>
                    {getStatusBadge(activePatient.status)}
                  </h2>
                  <p className="text-xs text-muted-foreground">{activePatient.email} • {activePatient.phone}</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border px-6 bg-muted/10 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-4 border-b-2 transition ${
                  activeTab === 'overview'
                    ? 'border-[#007b92] text-[#007b92]'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Overview & Profile
              </button>
              <button
                onClick={() => setActiveTab('registrations')}
                className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'registrations'
                    ? 'border-[#007b92] text-[#007b92]'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>Hospital Registrations</span>
                <span className="bg-muted text-muted-foreground px-1.5 py-0.2 rounded-full text-[10px]">
                  {activePatientRegistrations.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('relationships')}
                className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'relationships'
                    ? 'border-[#007b92] text-[#007b92]'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>Family Links</span>
                <span className="bg-muted text-muted-foreground px-1.5 py-0.2 rounded-full text-[10px]">
                  {activePatientRelationships.length}
                </span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* TAB 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl border border-border bg-background">
                      <span className="text-muted-foreground block text-[11px]">System ID</span>
                      <span className="font-mono font-semibold text-foreground text-sm mt-0.5 block">#{activePatient.id}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-border bg-background">
                      <span className="text-muted-foreground block text-[11px]">Gender</span>
                      <span className="font-semibold text-foreground text-sm mt-0.5 block capitalize">{activePatient.gender?.toLowerCase() || 'Unspecified'}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-border bg-background">
                      <span className="text-muted-foreground block text-[11px]">Age / DOB</span>
                      <span className="font-semibold text-foreground text-sm mt-0.5 block">
                        {calculateAge(activePatient.dateOfBirth)}
                        {activePatient.dateOfBirth && <span className="text-[10px] text-muted-foreground block font-normal">{activePatient.dateOfBirth}</span>}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl border border-border bg-background">
                      <span className="text-muted-foreground block text-[11px]">Blood Group</span>
                      <span className="font-semibold text-rose-600 text-sm mt-0.5 block">{activePatient.bloodGroup || 'Not set'}</span>
                    </div>
                  </div>

                  <div className="bg-muted/30 border border-border/70 rounded-xl p-4 space-y-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Emergency Contact</span>
                      <span className="font-medium text-foreground">{activePatient.emergencyContact || 'None provided'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Residential Address</span>
                      <span className="font-medium text-foreground">{activePatient.address || 'None provided'}</span>
                    </div>
                    {activePatient.userId && (
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Linked IAM User</span>
                        <span className="font-mono text-foreground">{activePatient.userId}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-muted-foreground border-t border-border pt-3 flex justify-between">
                    <span>Registered: {activePatient.createdAt ? new Date(activePatient.createdAt).toLocaleDateString() : 'N/A'}</span>
                    <span>Last Updated: {activePatient.updatedAt ? new Date(activePatient.updatedAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              )}

              {/* TAB 2: Hospital Registrations */}
              {activeTab === 'registrations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Hospital Deployments
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Unique hospital registration numbers assigned to this patient.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveModal('add-reg')}
                      className="bg-[#007b92] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#006072] transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Register at Hospital
                    </button>
                  </div>

                  {activePatientRegistrations.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                      No hospital registrations found. Register this patient at a facility to enable local admissions and encounters.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activePatientRegistrations.map((reg) => (
                        <div key={reg.id} className="p-3 rounded-xl border border-border bg-background flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#007b92]">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-foreground flex items-center gap-2">
                                <span>{hospitals.find((h) => h.id === reg.hospitalId)?.name || `Hospital #${reg.hospitalId}`}</span>
                                <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded text-[#007b92]">
                                  {reg.registrationNumber}
                                </span>
                              </div>
                              <div className="text-muted-foreground text-[11px] mt-0.5">
                                Registered on {reg.registrationDate}
                              </div>
                            </div>
                          </div>
                          <div>{getStatusBadge(reg.status)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Family Links */}
              {activeTab === 'relationships' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Family Relationships
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Linked family members for pediatric care, guardian consent, and emergency contacts.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveModal('add-rel')}
                      className="bg-[#007b92] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#006072] transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Relation Link
                    </button>
                  </div>

                  {activePatientRelationships.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                      No family relationships linked to this patient.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activePatientRelationships.map((rel) => (
                        <div key={rel.id} className="p-3 rounded-xl border border-border bg-background flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
                              <Link2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-foreground flex items-center gap-2">
                                <span className="uppercase text-[11px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 border border-indigo-200 dark:border-indigo-800">
                                  {rel.relationshipType.replace('_', ' ')}
                                </span>
                                <span>{rel.targetPatientFirstName} {rel.targetPatientLastName}</span>
                                {rel.targetPatientMrn && (
                                  <span className="font-mono text-[11px] text-muted-foreground">({rel.targetPatientMrn})</span>
                                )}
                              </div>
                              {rel.notes && (
                                <div className="text-muted-foreground text-[11px] mt-0.5">
                                  Note: {rel.notes}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteRelationship(rel.id)}
                            className="p-1 rounded hover:bg-rose-50 text-muted-foreground hover:text-rose-600 transition"
                            title="Unlink Relationship"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-muted/20 border-t border-border flex justify-between items-center">
              <button
                onClick={() => openEditModal(activePatient)}
                className="text-xs font-semibold text-[#007b92] hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Demographics
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-muted text-foreground transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: Edit Patient Details --- */}
      {activeModal === 'edit' && activePatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <h2 className="text-base font-bold text-foreground">Edit Patient Profile</h2>
                <p className="text-xs text-muted-foreground">{activePatient.mrn} • #{activePatient.id}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">First Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  >
                    {GENDERS.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Blood Group</label>
                  <select
                    value={editForm.bloodGroup}
                    onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">Residential Address</label>
                  <textarea
                    rows={2}
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal('view')}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted text-foreground transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#007b92] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#006072] transition disabled:opacity-50 flex items-center gap-2 shadow-xs"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Save Changes</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: Add Hospital Registration --- */}
      {activeModal === 'add-reg' && activePatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h2 className="text-base font-bold text-foreground">Register Patient at Hospital</h2>
              <button onClick={() => setActiveModal('view')} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddHospitalReg} className="p-6 space-y-4">
              <p className="text-xs text-muted-foreground">
                Assign <strong>{activePatient.firstName} {activePatient.lastName}</strong> ({activePatient.mrn}) to a facility.
              </p>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Select Hospital *</label>
                  <select
                    required
                    value={newRegForm.hospitalId}
                    onChange={(e) => setNewRegForm({ ...newRegForm, hospitalId: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  >
                    <option value="">Choose Hospital...</option>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id.toString()}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Registration Date</label>
                  <input
                    type="date"
                    value={newRegForm.registrationDate}
                    onChange={(e) => setNewRegForm({ ...newRegForm, registrationDate: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal('view')}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted text-foreground transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#007b92] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#006072] transition disabled:opacity-50 shadow-xs"
                >
                  {submitting ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 5: Add Family Relationship --- */}
      {activeModal === 'add-rel' && activePatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h2 className="text-base font-bold text-foreground">Link Family Member</h2>
              <button onClick={() => setActiveModal('view')} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRelationship} className="p-6 space-y-4">
              <p className="text-xs text-muted-foreground">
                Establish a family relationship from <strong>{activePatient.firstName} {activePatient.lastName}</strong> ({activePatient.mrn}).
              </p>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Relationship Type *</label>
                  <select
                    value={newRelForm.relationshipType}
                    onChange={(e) => setNewRelForm({ ...newRelForm, relationshipType: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  >
                    {RELATIONSHIP_TYPES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Target Relative (Patient) *</label>
                  <select
                    required
                    value={newRelForm.targetPatientId}
                    onChange={(e) => setNewRelForm({ ...newRelForm, targetPatientId: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  >
                    <option value="">Select Relative Patient...</option>
                    {patients
                      .filter((p) => p.id !== activePatient.id)
                      .map((p) => (
                        <option key={p.id} value={p.id.toString()}>
                          {p.firstName} {p.lastName} ({p.mrn || `#${p.id}`})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Relationship Notes</label>
                  <input
                    type="text"
                    value={newRelForm.notes}
                    onChange={(e) => setNewRelForm({ ...newRelForm, notes: e.target.value })}
                    placeholder="e.g. Legal guardian / Emergency alternate"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal('view')}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted text-foreground transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#007b92] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#006072] transition disabled:opacity-50 shadow-xs"
                >
                  {submitting ? 'Linking...' : 'Link Relationship'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PatientsAdminPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto p-12 text-center text-muted-foreground">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#007b92] mb-2" />
        <p className="text-sm">Loading Patient Directory...</p>
      </div>
    }>
      <PatientsContent />
    </Suspense>
  );
}
