'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search, Plus, MoreVertical, Stethoscope, Building2, Layers,
  X, Edit2, Eye, Trash2, CheckCircle2, AlertCircle, Clock,
  User, Mail, Phone, Calendar, Briefcase, Award, RefreshCw
} from 'lucide-react';

interface HospitalAssignment {
  id: number;
  doctorId: number;
  hospitalId: number;
  departmentId: number;
  designation?: string;
  status: string;
  publicAppointmentEnabled: boolean;
  inHouseClinicalEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Doctor {
  id: number;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  status: string;
  bio?: string;
  qualifications?: string;
  specialization?: string;
  registrationNumber?: string;
  experienceYears?: number;
  profilePictureUrl?: string;
  defaultConsultationFee?: number;
  profileStatus?: string;
  assignments: HospitalAssignment[];
}

interface Hospital {
  id: number;
  name: string;
  code: string;
  status?: string;
}

interface Department {
  id: number;
  hospitalId: number;
  name: string;
  code: string;
  status?: string;
}

function DoctorsContent() {
  const searchParams = useSearchParams();
  const initialHospitalId = searchParams.get('hospitalId');

  // Core Data State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<string>(initialHospitalId || 'all');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [selectedEngagement, setSelectedEngagement] = useState<string>('all');

  // Modals State
  const [activeModal, setActiveModal] = useState<'register' | 'view' | 'edit' | 'assignments' | null>(null);
  const [activeDoctor, setActiveDoctor] = useState<Doctor | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Registration Form State
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'MALE',
    dateOfBirth: '',
    specialization: '',
    qualifications: '',
    experienceYears: '',
    registrationNumber: '',
    defaultConsultationFee: '',
    bio: '',
    hospitalId: '',
    departmentId: '',
    designation: 'Consultant'
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    status: 'ACTIVE',
    specialization: '',
    qualifications: '',
    experienceYears: '',
    registrationNumber: '',
    defaultConsultationFee: '',
    bio: ''
  });

  // New Assignment Form State (inside Assignment Modal)
  const [newAssignment, setNewAssignment] = useState({
    hospitalId: '',
    departmentId: '',
    designation: 'Consultant',
    publicAppointmentEnabled: false,
    inHouseClinicalEnabled: true
  });

  // Fetch Hospitals & Departments lookup tables
  useEffect(() => {
    async function loadLookups() {
      try {
        const [hospRes, deptRes] = await Promise.all([
          fetch('/api/proxy/api/v1/hospitals'),
          fetch('/api/proxy/api/v1/departments')
        ]);
        if (hospRes.ok) {
          const hospData = await hospRes.json();
          setHospitals(hospData.data || []);
        }
        if (deptRes.ok) {
          const deptData = await deptRes.json();
          setDepartments(deptData.data || []);
        }
      } catch (err) {
        console.error('Failed to load lookup data', err);
      }
    }
    loadLookups();
  }, []);

  // Fetch Doctors Directory
  async function loadDoctors(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      let url = '/api/proxy/api/v1/doctors/directory';
      const params = new URLSearchParams();
      if (selectedHospital && selectedHospital !== 'all') {
        params.append('hospitalId', selectedHospital);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `Failed to fetch doctors (HTTP ${res.status})`);
      }
      const json = await res.json();
      setDoctors(json.data || []);
    } catch (err: any) {
      console.error('Error fetching doctors:', err);
      setError(err.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDoctors();
  }, [selectedHospital]);

  // Derived filter options
  const specializations = useMemo(() => {
    const specs = new Set<string>();
    doctors.forEach(d => {
      if (d.specialization && d.specialization.trim()) {
        specs.add(d.specialization.trim());
      }
    });
    return Array.from(specs).sort();
  }, [doctors]);

  // Filtered doctors list
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const fullName = `${doc.firstName} ${doc.lastName}`.toLowerCase();
      const docCode = `doc-${doc.id}`.toLowerCase();
      const matchesSearch = !query ||
        fullName.includes(query) ||
        docCode.includes(query) ||
        doc.email.toLowerCase().includes(query) ||
        (doc.specialization && doc.specialization.toLowerCase().includes(query));

      // Specialization match
      const matchesSpec = selectedSpecialization === 'all' || doc.specialization === selectedSpecialization;

      // Engagement match
      let matchesEngagement = true;
      if (selectedEngagement !== 'all') {
        if (!doc.assignments || doc.assignments.length === 0) {
          matchesEngagement = false;
        } else {
          matchesEngagement = doc.assignments.some(a => {
            if (selectedEngagement === 'public') return a.publicAppointmentEnabled;
            if (selectedEngagement === 'inhouse') return a.inHouseClinicalEnabled;
            if (selectedEngagement === 'both') return a.publicAppointmentEnabled && a.inHouseClinicalEnabled;
            return false;
          });
        }
      }

      return matchesSearch && matchesSpec && matchesEngagement;
    });
  }, [doctors, searchQuery, selectedSpecialization, selectedEngagement]);

  // Helper maps for names
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

  // Departments for Register form
  const registerDepartments = useMemo(() => {
    if (!registerForm.hospitalId) return [];
    const hId = parseInt(registerForm.hospitalId);
    return departments.filter(d => d.hospitalId === hId);
  }, [registerForm.hospitalId, departments]);

  // Departments for New Assignment form
  const newAssignmentDepartments = useMemo(() => {
    if (!newAssignment.hospitalId) return [];
    const hId = parseInt(newAssignment.hospitalId);
    return departments.filter(d => d.hospitalId === hId);
  }, [newAssignment.hospitalId, departments]);

  // Notification auto-clear
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Handlers
  async function handleRegisterDoctor(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // 1. Create Core Doctor + IAM User
      const createRes = await fetch('/api/proxy/api/v1/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: registerForm.firstName.trim(),
          lastName: registerForm.lastName.trim(),
          email: registerForm.email.trim(),
          phone: registerForm.phone ? registerForm.phone.trim() : null,
          gender: registerForm.gender || null,
          dateOfBirth: registerForm.dateOfBirth || null
        })
      });

      if (!createRes.ok) {
        const errJson = await createRes.json().catch(() => null);
        throw new Error(errJson?.message || 'Failed to register doctor identity');
      }

      const created = await createRes.json();
      const doctorId = created.data.id;

      // 2. Upsert Doctor Profile if details provided
      if (
        registerForm.specialization ||
        registerForm.qualifications ||
        registerForm.experienceYears ||
        registerForm.registrationNumber ||
        registerForm.defaultConsultationFee ||
        registerForm.bio
      ) {
        await fetch(`/api/proxy/api/v1/doctors/${doctorId}/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            specializations: registerForm.specialization.trim() || null,
            qualifications: registerForm.qualifications.trim() || null,
            experienceYears: registerForm.experienceYears ? parseInt(registerForm.experienceYears) : null,
            registrationNumber: registerForm.registrationNumber.trim() || null,
            defaultConsultationFee: registerForm.defaultConsultationFee ? parseFloat(registerForm.defaultConsultationFee) : null,
            bio: registerForm.bio.trim() || null
          })
        });
      }

      // 3. Create Initial Hospital Assignment if selected
      if (registerForm.hospitalId && registerForm.departmentId) {
        await fetch(`/api/proxy/api/v1/doctors/${doctorId}/assignments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hospitalId: parseInt(registerForm.hospitalId),
            departmentId: parseInt(registerForm.departmentId),
            designation: registerForm.designation.trim() || 'Consultant',
            status: 'ACTIVE'
          })
        });
      }

      setSuccess(`Doctor ${registerForm.firstName} ${registerForm.lastName} registered successfully!`);
      setActiveModal(null);
      // Reset form
      setRegisterForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: 'MALE',
        dateOfBirth: '',
        specialization: '',
        qualifications: '',
        experienceYears: '',
        registrationNumber: '',
        defaultConsultationFee: '',
        bio: '',
        hospitalId: '',
        departmentId: '',
        designation: 'Consultant'
      });
      loadDoctors(true);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Failed to register doctor');
    } finally {
      setSubmitting(false);
    }
  }

  function openEditModal(doctor: Doctor) {
    setActiveDoctor(doctor);
    setEditForm({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phone: doctor.phone || '',
      gender: doctor.gender || 'MALE',
      dateOfBirth: doctor.dateOfBirth || '',
      status: doctor.status || 'ACTIVE',
      specialization: doctor.specialization || '',
      qualifications: doctor.qualifications || '',
      experienceYears: doctor.experienceYears ? doctor.experienceYears.toString() : '',
      registrationNumber: doctor.registrationNumber || '',
      defaultConsultationFee: doctor.defaultConsultationFee ? doctor.defaultConsultationFee.toString() : '',
      bio: doctor.bio || ''
    });
    setActiveModal('edit');
    setOpenDropdownId(null);
  }

  async function handleUpdateDoctor(e: React.FormEvent) {
    e.preventDefault();
    if (!activeDoctor) return;
    setSubmitting(true);
    setError(null);

    try {
      // 1. Update Core Doctor
      const res = await fetch(`/api/proxy/api/v1/doctors/${activeDoctor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone ? editForm.phone.trim() : null,
          gender: editForm.gender || null,
          dateOfBirth: editForm.dateOfBirth || null,
          status: editForm.status
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || 'Failed to update doctor details');
      }

      // 2. Update Profile
      await fetch(`/api/proxy/api/v1/doctors/${activeDoctor.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specializations: editForm.specialization.trim() || null,
          qualifications: editForm.qualifications.trim() || null,
          experienceYears: editForm.experienceYears ? parseInt(editForm.experienceYears) : null,
          registrationNumber: editForm.registrationNumber.trim() || null,
          defaultConsultationFee: editForm.defaultConsultationFee ? parseFloat(editForm.defaultConsultationFee) : null,
          bio: editForm.bio.trim() || null
        })
      });

      setSuccess(`Doctor ${editForm.firstName} ${editForm.lastName} updated successfully!`);
      setActiveModal(null);
      loadDoctors(true);
    } catch (err: any) {
      console.error('Update failed:', err);
      setError(err.message || 'Failed to update doctor');
    } finally {
      setSubmitting(false);
    }
  }

  function openAssignmentsModal(doctor: Doctor) {
    setActiveDoctor(doctor);
    setNewAssignment({
      hospitalId: '',
      departmentId: '',
      designation: 'Consultant',
      publicAppointmentEnabled: false,
      inHouseClinicalEnabled: true
    });
    setActiveModal('assignments');
    setOpenDropdownId(null);
  }

  async function handleAddAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!activeDoctor || !newAssignment.hospitalId || !newAssignment.departmentId) return;
    setSubmitting(true);
    setError(null);

    try {
      if (!newAssignment.publicAppointmentEnabled && !newAssignment.inHouseClinicalEnabled) {
        throw new Error('Select at least one doctor engagement.');
      }

      const res = await fetch(`/api/proxy/api/v1/doctors/${activeDoctor.id}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: parseInt(newAssignment.hospitalId),
          departmentId: parseInt(newAssignment.departmentId),
          designation: newAssignment.designation.trim() || 'Consultant',
          status: 'ACTIVE',
          publicAppointmentEnabled: newAssignment.publicAppointmentEnabled,
          inHouseClinicalEnabled: newAssignment.inHouseClinicalEnabled
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || 'Failed to assign doctor to hospital');
      }

      setSuccess('Hospital assignment created successfully!');
      setNewAssignment({ hospitalId: '', departmentId: '', designation: 'Consultant', publicAppointmentEnabled: false, inHouseClinicalEnabled: true });
      // Refresh directory and current active doctor assignments
      await loadDoctors(true);
      // Re-fetch doctor assignments for modal
      const updatedRes = await fetch(`/api/proxy/api/v1/doctors/${activeDoctor.id}/assignments`);
      if (updatedRes.ok) {
        const updatedJson = await updatedRes.json();
        setActiveDoctor(prev => prev ? { ...prev, assignments: updatedJson.data || [] } : null);
      }
    } catch (err: any) {
      console.error('Assignment failed:', err);
      setError(err.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteAssignment(assignmentId: number) {
    if (!confirm('Are you sure you want to remove this hospital assignment?')) return;
    setError(null);

    try {
      const res = await fetch(`/api/proxy/api/v1/doctors/assignments/${assignmentId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || 'Failed to delete assignment');
      }

      setSuccess('Hospital assignment removed successfully!');
      await loadDoctors(true);
      if (activeDoctor) {
        const updatedRes = await fetch(`/api/proxy/api/v1/doctors/${activeDoctor.id}/assignments`);
        if (updatedRes.ok) {
          const updatedJson = await updatedRes.json();
          setActiveDoctor(prev => prev ? { ...prev, assignments: updatedJson.data || [] } : null);
        }
      }
    } catch (err: any) {
      console.error('Delete assignment failed:', err);
      setError(err.message || 'Failed to remove assignment');
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Doctor Management</h1>
          <p className="text-muted-foreground mt-1">Manage doctor profiles, specializations, and hospital assignments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDoctors(true)}
            disabled={refreshing}
            className="p-2 border border-border rounded-lg hover:bg-background text-muted-foreground transition"
            title="Refresh Doctor Directory"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/doctors/new"
            className="bg-[#007b92] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#006072] transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Register Doctor
          </Link>
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
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctors by name, DOC ID, or email..." 
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] focus:bg-card transition-all"
          />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto">
          <select 
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
            className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92]"
          >
            <option value="all">All Hospitals</option>
            {hospitals.map(h => (
              <option key={h.id} value={h.id.toString()}>{h.name}</option>
            ))}
          </select>
          <select 
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92]"
          >
            <option value="all">All Specializations</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
          <select 
            value={selectedEngagement}
            onChange={(e) => setSelectedEngagement(e.target.value)}
            className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92]"
          >
            <option value="all">All Engagement</option>
            <option value="public">Public Appointment</option>
            <option value="inhouse">In-House</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted/40 rounded-full"></div>
                  <div className="space-y-1.5">
                    <div className="w-36 h-4 bg-muted/40 rounded"></div>
                    <div className="w-20 h-3 bg-muted/30 rounded"></div>
                  </div>
                </div>
                <div className="w-24 h-4 bg-muted/40 rounded"></div>
                <div className="w-32 h-4 bg-muted/40 rounded"></div>
                <div className="w-16 h-4 bg-muted/40 rounded"></div>
                <div className="w-20 h-4 bg-muted/40 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-accent/40 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-card-foreground">No doctors found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {searchQuery || selectedHospital !== 'all' || selectedSpecialization !== 'all'
                ? 'No doctors match your search or filter criteria. Try resetting filters.'
                : 'No doctors are currently registered. Register your first doctor to begin.'}
            </p>
            {(searchQuery || selectedHospital !== 'all' || selectedSpecialization !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedHospital('all');
                  setSelectedSpecialization('all');
                }}
                className="text-sm text-[#007b92] font-medium hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-background border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Doctor Profile</th>
                  <th className="px-6 py-3 font-medium">Specialization</th>
                  <th className="px-6 py-3 font-medium">Hospital & Department</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Availability</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredDoctors.map((doc) => {
                  return (
                    <tr key={doc.id} className="hover:bg-background transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {doc.profilePictureUrl ? (
                              <img src={doc.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Stethoscope className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-card-foreground">
                              Dr. {doc.firstName} {doc.lastName}
                            </div>
                            <div className="text-muted-foreground text-xs flex items-center gap-2">
                              <span>DOC-{doc.id}</span>
                              {doc.email && <span>• {doc.email}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-card-foreground font-medium">
                          {doc.specialization || 'General Practitioner'}
                        </div>
                        {doc.qualifications && (
                          <div className="text-muted-foreground text-xs">{doc.qualifications}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {doc.assignments && doc.assignments.length > 0 ? (
                          <div className="space-y-1">
                            {doc.assignments.map(a => (
                              <div key={a.id} className="flex items-center gap-1.5 text-xs text-card-foreground/90">
                                <Building2 className="w-3.5 h-3.5 text-[#007b92] flex-shrink-0" />
                                <span className="font-medium">{hospitalMap.get(a.hospitalId) || `Hospital ${a.hospitalId}`}</span>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground">{departmentMap.get(a.departmentId) || `Dept ${a.departmentId}`}</span>
                                {a.designation && (
                                  <span className="bg-accent/40 text-muted-foreground px-1.5 py-0.5 rounded text-[10px]">
                                    {a.designation}
                                  </span>
                                )}
                                {a.publicAppointmentEnabled && a.inHouseClinicalEnabled ? (
                                  <span className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded text-[10px] font-medium ml-1 whitespace-nowrap">
                                    BOTH
                                  </span>
                                ) : a.publicAppointmentEnabled ? (
                                  <span className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded text-[10px] font-medium ml-1 whitespace-nowrap">
                                    PUBLIC APPOINTMENT
                                  </span>
                                ) : a.inHouseClinicalEnabled ? (
                                  <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] font-medium ml-1 whitespace-nowrap">
                                    IN-HOUSE
                                  </span>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          doc.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : doc.status === 'SUSPENDED'
                            ? 'bg-red-500/10 text-red-700 dark:text-red-400'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            doc.status === 'ACTIVE'
                              ? 'bg-emerald-500'
                              : doc.status === 'SUSPENDED'
                              ? 'bg-red-500'
                              : 'bg-muted-foreground'
                          }`}></span>
                          {doc.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/admin/availability?doctorId=${doc.id}`}
                          className="text-[#007b92] text-xs font-medium hover:underline inline-flex items-center gap-1"
                        >
                          <Clock className="w-3.5 h-3.5" /> Manage Schedule
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block text-left">
                          <button 
                            onClick={() => setOpenDropdownId(openDropdownId === doc.id ? null : doc.id)}
                            className="p-1.5 rounded-lg text-muted-foreground/70 hover:text-muted-foreground hover:bg-background transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {openDropdownId === doc.id && (
                            <div className="absolute right-0 mt-1 w-44 bg-card border border-border rounded-xl shadow-lg z-20 py-1 text-sm">
                              <button
                                onClick={() => {
                                  setActiveDoctor(doc);
                                  setActiveModal('view');
                                  setOpenDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-background flex items-center gap-2 text-card-foreground"
                              >
                                <Eye className="w-4 h-4 text-muted-foreground" /> View Profile
                              </button>
                              <button
                                onClick={() => openEditModal(doc)}
                                className="w-full text-left px-4 py-2 hover:bg-background flex items-center gap-2 text-card-foreground"
                              >
                                <Edit2 className="w-4 h-4 text-muted-foreground" /> Edit Doctor
                              </button>
                              <button
                                onClick={() => openAssignmentsModal(doc)}
                                className="w-full text-left px-4 py-2 hover:bg-background flex items-center gap-2 text-card-foreground"
                              >
                                <Building2 className="w-4 h-4 text-[#007b92]" /> Hospital Links
                              </button>
                            </div>
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

      {/* MODAL 1: REGISTER DOCTOR */}
      {activeModal === 'register' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto sm:p-6 sm:pt-10">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-card-foreground">Register New Doctor</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Creates IAM account, doctor identity, professional profile & hospital assignment</p>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="p-1 rounded-lg text-muted-foreground hover:bg-background transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterDoctor} className="p-6 space-y-6">
              {/* Section 1: Core Identity */}
              <div>
                <h3 className="text-xs font-semibold text-[#007b92] uppercase tracking-wider mb-3">1. Personal & Identity</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">First Name *</label>
                    <input 
                      type="text" 
                      required
                      value={registerForm.firstName}
                      onChange={e => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                      placeholder="e.g. Ramesh"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Last Name *</label>
                    <input 
                      type="text" 
                      required
                      value={registerForm.lastName}
                      onChange={e => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                      placeholder="e.g. Kumar"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Email Address *</label>
                    <input 
                      type="email" 
                      required
                      value={registerForm.email}
                      onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                      placeholder="doctor@swarnikacare.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={registerForm.phone}
                      onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Gender</label>
                    <select
                      value={registerForm.gender}
                      onChange={e => setRegisterForm({ ...registerForm, gender: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Date of Birth</label>
                    <input 
                      type="date" 
                      value={registerForm.dateOfBirth}
                      onChange={e => setRegisterForm({ ...registerForm, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Professional Profile */}
              <div className="pt-2 border-t border-border">
                <h3 className="text-xs font-semibold text-[#007b92] uppercase tracking-wider mb-3">2. Professional Profile</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Specialization</label>
                    <input 
                      type="text" 
                      value={registerForm.specialization}
                      onChange={e => setRegisterForm({ ...registerForm, specialization: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                      placeholder="e.g. Cardiology, Surgery"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Qualifications</label>
                    <input 
                      type="text" 
                      value={registerForm.qualifications}
                      onChange={e => setRegisterForm({ ...registerForm, qualifications: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                      placeholder="e.g. MBBS, MD, MS"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Medical Registration Number</label>
                    <input 
                      type="text" 
                      value={registerForm.registrationNumber}
                      onChange={e => setRegisterForm({ ...registerForm, registrationNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                      placeholder="e.g. MCI-2024-98765"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Experience (Years)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={registerForm.experienceYears}
                      onChange={e => setRegisterForm({ ...registerForm, experienceYears: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                      placeholder="e.g. 10"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Consultation Fee (₹)</label>
                    <input 
                      type="number" 
                      min="0"
                      step="50"
                      value={registerForm.defaultConsultationFee}
                      onChange={e => setRegisterForm({ ...registerForm, defaultConsultationFee: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                      placeholder="e.g. 800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Doctor Bio</label>
                    <textarea 
                      rows={2}
                      value={registerForm.bio}
                      onChange={e => setRegisterForm({ ...registerForm, bio: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                      placeholder="Brief overview of clinical practice and clinical interests..."
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Hospital & Department Assignment */}
              <div className="pt-2 border-t border-border">
                <h3 className="text-xs font-semibold text-[#007b92] uppercase tracking-wider mb-3">3. Primary Hospital Assignment (Optional)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Hospital</label>
                    <select
                      value={registerForm.hospitalId}
                      onChange={e => setRegisterForm({ ...registerForm, hospitalId: e.target.value, departmentId: '' })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                    >
                      <option value="">Select Hospital</option>
                      {hospitals.map(h => (
                        <option key={h.id} value={h.id.toString()}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Department</label>
                    <select
                      disabled={!registerForm.hospitalId}
                      value={registerForm.departmentId}
                      onChange={e => setRegisterForm({ ...registerForm, departmentId: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] disabled:opacity-50"
                    >
                      <option value="">Select Department</option>
                      {registerDepartments.map(d => (
                        <option key={d.id} value={d.id.toString()}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Designation</label>
                    <input 
                      type="text" 
                      value={registerForm.designation}
                      onChange={e => setRegisterForm({ ...registerForm, designation: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                      placeholder="e.g. Senior Consultant"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-background transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#007b92] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#006072] transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Register Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW DOCTOR PROFILE */}
      {activeModal === 'view' && activeDoctor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto sm:p-6 sm:pt-10">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/50 flex items-center justify-center overflow-hidden text-[#007b92]">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-card-foreground">
                    Dr. {activeDoctor.firstName} {activeDoctor.lastName}
                  </h2>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="font-mono">DOC-{activeDoctor.id}</span>
                    {activeDoctor.userId && <span>• IAM: {activeDoctor.userId}</span>}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="p-1 rounded-lg text-muted-foreground hover:bg-background transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Identity & Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </div>
                  <div className="font-medium text-card-foreground">{activeDoctor.email}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone Number
                  </div>
                  <div className="font-medium text-card-foreground">{activeDoctor.phone || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Gender
                  </div>
                  <div className="font-medium text-card-foreground">{activeDoctor.gender || 'Not specified'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Date of Birth
                  </div>
                  <div className="font-medium text-card-foreground">{activeDoctor.dateOfBirth || 'N/A'}</div>
                </div>
              </div>

              {/* Professional Credentials */}
              <div className="p-4 bg-background rounded-xl border border-border space-y-3">
                <div className="text-xs font-semibold text-[#007b92] uppercase tracking-wider">
                  Professional Credentials
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground">Specialization:</span>
                    <div className="font-medium text-card-foreground">{activeDoctor.specialization || 'General'}</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Qualifications:</span>
                    <div className="font-medium text-card-foreground">{activeDoctor.qualifications || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Registration No.:</span>
                    <div className="font-medium text-card-foreground">{activeDoctor.registrationNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Experience:</span>
                    <div className="font-medium text-card-foreground">
                      {activeDoctor.experienceYears ? `${activeDoctor.experienceYears} Years` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Consultation Fee:</span>
                    <div className="font-medium text-card-foreground">
                      {activeDoctor.defaultConsultationFee ? `₹${activeDoctor.defaultConsultationFee}` : 'Default OPD'}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Profile Status:</span>
                    <div className="font-medium text-card-foreground">{activeDoctor.profileStatus || 'DRAFT'}</div>
                  </div>
                </div>
                {activeDoctor.bio && (
                  <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground">
                    <span className="font-semibold text-card-foreground">Bio: </span>
                    {activeDoctor.bio}
                  </div>
                )}
              </div>

              {/* Hospital Assignments */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-[#007b92] uppercase tracking-wider">
                    Hospital & Department Assignments ({activeDoctor.assignments.length})
                  </h3>
                  <button
                    onClick={() => {
                      setActiveModal('assignments');
                    }}
                    className="text-xs text-[#007b92] font-medium hover:underline flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Manage Assignments
                  </button>
                </div>
                {activeDoctor.assignments.length === 0 ? (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-400 text-xs">
                    This doctor currently has no active hospital assignments. Click &quot;Manage Assignments&quot; to assign them to a hospital.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeDoctor.assignments.map(a => (
                      <div key={a.id} className="p-3 bg-background border border-border rounded-xl flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-4 h-4 text-[#007b92]" />
                          <div>
                            <div className="font-medium text-card-foreground">
                              {hospitalMap.get(a.hospitalId) || `Hospital ID ${a.hospitalId}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {departmentMap.get(a.departmentId) || `Dept ID ${a.departmentId}`} • {a.designation || 'Consultant'}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center p-6 border-t border-border bg-background/50">
              <Link
                href={`/admin/availability?doctorId=${activeDoctor.id}`}
                className="text-xs text-[#007b92] font-semibold hover:underline flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4" /> View or Configure Schedule
              </Link>
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-background transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT DOCTOR */}
      {activeModal === 'edit' && activeDoctor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto sm:p-6 sm:pt-10">
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl shadow-xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-card-foreground">Edit Doctor: Dr. {activeDoctor.firstName} {activeDoctor.lastName}</h2>
              <button 
                onClick={() => setActiveModal(null)} 
                className="p-1 rounded-lg text-muted-foreground hover:bg-background transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDoctor} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">First Name *</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.firstName}
                    onChange={e => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Last Name *</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.lastName}
                    onChange={e => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Email *</label>
                  <input 
                    type="email" 
                    required
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
                  <input 
                    type="tel" 
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Specialization</label>
                  <input 
                    type="text" 
                    value={editForm.specialization}
                    onChange={e => setEditForm({ ...editForm, specialization: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Qualifications</label>
                  <input 
                    type="text" 
                    value={editForm.qualifications}
                    onChange={e => setEditForm({ ...editForm, qualifications: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Registration No.</label>
                  <input 
                    type="text" 
                    value={editForm.registrationNumber}
                    onChange={e => setEditForm({ ...editForm, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Bio</label>
                <textarea 
                  rows={2}
                  value={editForm.bio}
                  onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-background transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#007b92] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#006072] transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: MANAGE HOSPITAL ASSIGNMENTS */}
      {activeModal === 'assignments' && activeDoctor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto sm:p-6 sm:pt-10">
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl shadow-xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-card-foreground">Hospital Assignments</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Manage doctor deployment across hospitals and departments</p>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="p-1 rounded-lg text-muted-foreground hover:bg-background transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Existing assignments */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Current Deployments ({activeDoctor.assignments.length})
                </label>
                {activeDoctor.assignments.length === 0 ? (
                  <div className="p-4 bg-muted/40 rounded-xl text-xs text-muted-foreground text-center">
                    No hospital assignments found for Dr. {activeDoctor.firstName} {activeDoctor.lastName}.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {activeDoctor.assignments.map(a => (
                      <div key={a.id} className="p-3 bg-background border border-border rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-4 h-4 text-[#007b92]" />
                          <div>
                            <div className="font-semibold text-sm text-card-foreground">
                              {hospitalMap.get(a.hospitalId) || `Hospital ${a.hospitalId}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {departmentMap.get(a.departmentId) || `Dept ${a.departmentId}`} • {a.designation || 'Consultant'}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteAssignment(a.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                          title="Remove assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add assignment form */}
              <form onSubmit={handleAddAssignment} className="p-4 bg-background border border-border rounded-xl space-y-3">
                <div className="text-xs font-semibold text-[#007b92] uppercase tracking-wider">
                  Add New Hospital Link
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Hospital *</label>
                    <select
                      required
                      value={newAssignment.hospitalId}
                      onChange={e => setNewAssignment({ ...newAssignment, hospitalId: e.target.value, departmentId: '' })}
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                    >
                      <option value="">Select Hospital</option>
                      {hospitals.map(h => (
                        <option key={h.id} value={h.id.toString()}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Department *</label>
                    <select
                      required
                      disabled={!newAssignment.hospitalId}
                      value={newAssignment.departmentId}
                      onChange={e => setNewAssignment({ ...newAssignment, departmentId: e.target.value })}
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] disabled:opacity-50"
                    >
                      <option value="">Select Department</option>
                      {newAssignmentDepartments.map(d => (
                        <option key={d.id} value={d.id.toString()}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Designation</label>
                    <input 
                      type="text"
                      value={newAssignment.designation}
                      onChange={e => setNewAssignment({ ...newAssignment, designation: e.target.value })}
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                      placeholder="e.g. Visiting Cardiologist"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#007b92] mb-3">Engagement Profile</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${newAssignment.publicAppointmentEnabled ? 'bg-[#007b92]/5 border-[#007b92]' : 'bg-card border-border hover:bg-muted/50'}`}>
                      <input 
                        type="checkbox" 
                        checked={newAssignment.publicAppointmentEnabled}
                        onChange={e => setNewAssignment({ ...newAssignment, publicAppointmentEnabled: e.target.checked })}
                        className="w-4 h-4 mt-0.5 rounded text-[#007b92] focus:ring-[#007b92]"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground">Public Appointment</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Appears on public website for booking</span>
                      </div>
                    </label>
                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${newAssignment.inHouseClinicalEnabled ? 'bg-[#007b92]/5 border-[#007b92]' : 'bg-card border-border hover:bg-muted/50'}`}>
                      <input 
                        type="checkbox" 
                        checked={newAssignment.inHouseClinicalEnabled}
                        onChange={e => setNewAssignment({ ...newAssignment, inHouseClinicalEnabled: e.target.checked })}
                        className="w-4 h-4 mt-0.5 rounded text-[#007b92] focus:ring-[#007b92]"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground">In-House Clinical</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Internal role for hospital operations</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !newAssignment.hospitalId || !newAssignment.departmentId}
                    className="bg-[#007b92] text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#006072] transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    Add Deployment
                  </button>
                </div>
              </form>
            </div>

            <div className="flex justify-end p-6 border-t border-border">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-background transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function DoctorsAdminPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto p-8 space-y-4">
        <div className="w-48 h-8 bg-muted/40 animate-pulse rounded"></div>
        <div className="w-full h-96 bg-muted/20 animate-pulse rounded-xl"></div>
      </div>
    }>
      <DoctorsContent />
    </Suspense>
  );
}
