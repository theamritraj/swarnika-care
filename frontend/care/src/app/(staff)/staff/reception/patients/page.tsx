'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useReceptionSidebar } from '../components/ReceptionSidebarContext';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  CalendarPlus,
  UserCheck,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface Patient {
  id: number;
  mrn: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  createdAt?: string;
}

interface Hospital {
  id: number;
  name: string;
  city?: string;
}

interface HospitalRegistration {
  id: number;
  patientId: number;
  hospitalId: number;
  registrationDate: string;
  hospitalName?: string;
}

export default function ReceptionPatientDirectory() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { activeHospitalId } = useReceptionSidebar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Selected Patient Details / Drawer / Modals
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientRegistrations, setPatientRegistrations] = useState<HospitalRegistration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  // Demographic Update Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    bloodGroup: '',
    gender: 'MALE',
    dateOfBirth: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Hospital Registration Modal State
  const [isRegisterHospitalModalOpen, setIsRegisterHospitalModalOpen] = useState(false);
  const [targetHospitalId, setTargetHospitalId] = useState<number>(activeHospitalId || 1);
  const [savingHospitalReg, setSavingHospitalReg] = useState(false);

  // Fetch all patients and hospitals
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [patientsRes, hospitalsRes] = await Promise.all([
        fetch('/api/proxy/api/v1/patients'),
        fetch('/api/proxy/api/v1/hospitals'),
      ]);

      if (patientsRes.ok) {
        const pData = await patientsRes.json();
        setPatients(pData.data || []);
      }
      if (hospitalsRes.ok) {
        const hData = await hospitalsRes.json();
        setHospitals(hData.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load patient directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch hospital registrations for a patient
  const fetchHospitalRegistrations = async (patientId: number) => {
    setLoadingRegistrations(true);
    try {
      const res = await fetch(`/api/proxy/api/v1/patients/${patientId}/registrations`);
      if (res.ok) {
        const data = await res.json();
        setPatientRegistrations(data.data || []);
      }
    } catch (e) {
      console.warn('Failed to load patient hospital registrations:', e);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    fetchHospitalRegistrations(p.id);
  };

  // Open Edit Modal with current demographic values
  const handleOpenEdit = (p: Patient) => {
    setSelectedPatient(p);
    setEditFormData({
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
      emergencyContact: p.emergencyContact || '',
      bloodGroup: p.bloodGroup || '',
      gender: p.gender || 'MALE',
      dateOfBirth: p.dateOfBirth || '',
    });
    setIsEditModalOpen(true);
  };

  // Submit Demographic Update
  const handleSaveDemographics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setSavingEdit(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/api/v1/patients/${selectedPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to update demographics');
      }

      const updatedData = await res.json();
      const updatedPatient = updatedData.data;

      setPatients((prev) =>
        prev.map((pt) => (pt.id === updatedPatient.id ? updatedPatient : pt))
      );
      setSelectedPatient(updatedPatient);
      setSuccessMessage('Patient administrative demographics updated successfully');
      setIsEditModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Update failed');
    } finally {
      setSavingEdit(false);
    }
  };

  // Register existing patient at hospital
  const handleRegisterAtHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setSavingHospitalReg(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/api/v1/patients/${selectedPatient.id}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: targetHospitalId,
          registrationDate: new Date().toISOString().split('T')[0],
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to register patient at hospital');
      }

      setSuccessMessage(
        `Patient ${selectedPatient.firstName} registered at hospital branch successfully!`
      );
      setIsRegisterHospitalModalOpen(false);
      fetchHospitalRegistrations(selectedPatient.id);
    } catch (err: any) {
      setError(err.message || 'Hospital registration failed');
    } finally {
      setSavingHospitalReg(false);
    }
  };

  // Filter patients by search query
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase().trim();
    return patients.filter((p) => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const mrnMatch = p.mrn?.toLowerCase().includes(q);
      const phoneMatch = p.phone?.includes(q);
      const emailMatch = p.email?.toLowerCase().includes(q);
      return fullName.includes(q) || mrnMatch || phoneMatch || emailMatch;
    });
  }, [patients, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Patient Administrative Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Search patient identity, manage hospital registrations, and update contact demographics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/staff/reception/patients/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#007b92] text-white hover:bg-[#00667a] shadow-2xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Patient Registration</span>
          </Link>
          <button
            type="button"
            onClick={loadInitialData}
            disabled={loading}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg border border-border transition-colors cursor-pointer"
            title="Refresh Directory"
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

      {/* Search Input Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Patient Name, MRN (e.g. MRN-2026...), Phone number, or Email..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
          />
        </div>
      </div>

      {/* Directory Content: Grid / Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Patient List */}
        <div className="lg:col-span-7 bg-card border border-border rounded-xl overflow-hidden shadow-2xs flex flex-col">
          <div className="p-4 border-b border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#007b92]" />
              <h2 className="text-sm font-bold text-foreground">
                Registered Patients ({filteredPatients.length})
              </h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/60 max-h-[650px]">
            {loading ? (
              <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-[#007b92]" />
                <span>Loading patient directory...</span>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                No patients found. Click "New Patient Registration" to register a patient.
              </div>
            ) : (
              filteredPatients.map((p) => {
                const isSelected = selectedPatient?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPatient(p)}
                    className={`p-4 transition-colors cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-teal-50/70 dark:bg-teal-950/40 border-l-4 border-l-[#007b92]'
                        : 'hover:bg-slate-50/60 dark:hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          {p.firstName} {p.lastName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-muted-foreground">
                          {p.gender || '—'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                        <span className="font-mono text-[#007b92] font-semibold">{p.mrn}</span>
                        {p.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {p.phone}
                          </span>
                        )}
                        {p.dateOfBirth && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            DOB: {p.dateOfBirth}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(p);
                        }}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                        title="Edit Demographics"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Patient Admin Card & Actions */}
        <div className="lg:col-span-5 space-y-4">
          {selectedPatient ? (
            <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-border/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#007b92] text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs font-mono font-semibold text-[#007b92] mt-0.5">
                    MRN: {selectedPatient.mrn}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(selectedPatient)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-border hover:bg-accent transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Info</span>
                </button>
              </div>

              {/* Administrative Demographics (No clinical data) */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Phone
                  </span>
                  <span className="font-medium text-foreground">{selectedPatient.phone || '—'}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </span>
                  <span className="font-medium text-foreground">{selectedPatient.email || '—'}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Date of Birth
                  </span>
                  <span className="font-medium text-foreground">{selectedPatient.dateOfBirth || '—'}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Blood Group</span>
                  <span className="font-medium text-foreground">{selectedPatient.bloodGroup || '—'}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Emergency Contact
                  </span>
                  <span className="font-medium text-foreground">{selectedPatient.emergencyContact || '—'}</span>
                </div>

                <div className="py-1">
                  <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Residential Address
                  </span>
                  <p className="font-medium text-foreground bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-border/40 text-[11px]">
                    {selectedPatient.address || 'Address not registered'}
                  </p>
                </div>
              </div>

              {/* Hospital Registrations */}
              <div className="pt-2 border-t border-border/80">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#007b92]" />
                    Hospital Registrations
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetHospitalId(activeHospitalId || 1);
                      setIsRegisterHospitalModalOpen(true);
                    }}
                    className="text-[11px] font-semibold text-[#007b92] hover:underline"
                  >
                    + Register at Branch
                  </button>
                </div>

                {loadingRegistrations ? (
                  <p className="text-xs text-muted-foreground">Loading hospital links...</p>
                ) : patientRegistrations.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    Registered globally. Click "+ Register at Branch" to link with current hospital.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {patientRegistrations.map((reg) => {
                      const hosp = hospitals.find((h) => h.id === reg.hospitalId);
                      return (
                        <div
                          key={reg.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border/50 text-xs"
                        >
                          <span className="font-semibold text-foreground">
                            {hosp?.name || `Hospital Branch #${reg.hospitalId}`}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Since {reg.registrationDate || '2026'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Operational Dispatch Actions */}
              <div className="pt-2 border-t border-border/80 space-y-2">
                <Link
                  href={`/staff/reception/appointments/new?patientId=${selectedPatient.id}`}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#007b92] text-white hover:bg-[#00667a] shadow-2xs transition-colors"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Book Appointment for Patient</span>
                </Link>

                <Link
                  href={`/staff/reception/walk-in?patientId=${selectedPatient.id}`}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Immediate Walk-in Intake</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-8 shadow-2xs text-center text-muted-foreground">
              <Users className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm font-semibold text-foreground">No Patient Selected</p>
              <p className="text-xs text-muted-foreground mt-1">
                Select a patient from the directory on the left or search above to view administrative details and trigger front desk operations.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Demographic Update Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-foreground mb-1">
              Update Administrative Demographics
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Front desk administrative data modification. Clinical diagnosis and treatment notes are strictly prohibited.
            </p>

            <form onSubmit={handleSaveDemographics} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editFormData.dateOfBirth}
                    onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={editFormData.emergencyContact}
                    onChange={(e) => setEditFormData({ ...editFormData, emergencyContact: e.target.value })}
                    placeholder="Name / Phone"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">Residential Address</label>
                <textarea
                  rows={2}
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-border hover:bg-accent text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-lg bg-[#007b92] text-white hover:bg-[#00667a] font-semibold transition-colors disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save Demographics'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hospital Registration Modal */}
      {isRegisterHospitalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsRegisterHospitalModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-foreground mb-1">
              Register Patient at Hospital Branch
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Links patient MRN with the selected Swarnika hospital branch without duplicating identity.
            </p>

            <form onSubmit={handleRegisterAtHospital} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-medium mb-1">
                  Select Hospital Branch
                </label>
                <select
                  value={targetHospitalId}
                  onChange={(e) => setTargetHospitalId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} {h.city ? `(${h.city})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsRegisterHospitalModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-border hover:bg-accent text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingHospitalReg}
                  className="px-4 py-2 rounded-lg bg-[#007b92] text-white hover:bg-[#00667a] font-semibold transition-colors disabled:opacity-50"
                >
                  {savingHospitalReg ? 'Registering...' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
