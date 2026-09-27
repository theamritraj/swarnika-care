'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useReceptionSidebar } from '../../components/ReceptionSidebarContext';
import {
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarPlus,
  UserCheck,
  RefreshCw,
  Phone,
  Mail,
  User,
  MapPin,
  ShieldCheck
} from 'lucide-react';

interface Hospital {
  id: number;
  name: string;
  city?: string;
}

export default function NewPatientRegistrationPage() {
  const router = useRouter();
  const { activeHospitalId } = useReceptionSidebar();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPatient, setCreatedPatient] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: 'B+',
    address: '',
    emergencyContact: '',
    hospitalId: activeHospitalId || 1,
  });

  useEffect(() => {
    async function loadHospitals() {
      try {
        const res = await fetch('/api/proxy/api/v1/hospitals');
        if (res.ok) {
          const data = await res.json();
          const list = data.data || [];
          setHospitals(list);
          if (list.length > 0 && !formData.hospitalId) {
            setFormData((prev) => ({ ...prev, hospitalId: list[0].id }));
          }
        }
      } catch (e) {
        console.error('Failed to load hospitals:', e);
      }
    }
    loadHospitals();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'hospitalId' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        address: formData.address.trim(),
        emergencyContact: formData.emergencyContact.trim(),
        hospitalId: Number(formData.hospitalId),
      };

      const res = await fetch('/api/proxy/api/v1/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Registration failed. Check patient phone/email uniqueness.');
      }

      const resData = await res.json();
      setCreatedPatient(resData.data);
    } catch (err: any) {
      setError(err.message || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/staff/reception/patients"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Patient Directory</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            New Patient Registration
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Register new patient identity in Swarnika ecosystem. System automatically generates standardized MRN.
          </p>
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

      {/* Success View */}
      {createdPatient ? (
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xs text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">
              Patient Registered Successfully!
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Permanent Medical Record Number (MRN) assigned and persisted.
            </p>
          </div>

          {/* Patient Card Preview */}
          <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border text-left space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="font-bold text-sm text-foreground">
                {createdPatient.firstName} {createdPatient.lastName}
              </span>
              <span className="font-mono font-bold text-sm text-[#007b92] bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
                {createdPatient.mrn}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div>Phone: <span className="font-medium text-foreground">{createdPatient.phone}</span></div>
              <div>Email: <span className="font-medium text-foreground">{createdPatient.email}</span></div>
              <div>Gender: <span className="font-medium text-foreground">{createdPatient.gender}</span></div>
              <div>DOB: <span className="font-medium text-foreground">{createdPatient.dateOfBirth}</span></div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={`/staff/reception/appointments/new?patientId=${createdPatient.id}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#007b92] text-white hover:bg-[#00667a] shadow-xs transition-colors"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Book OPD Appointment</span>
            </Link>

            <Link
              href={`/staff/reception/walk-in?patientId=${createdPatient.id}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              <span>Immediate Walk-in Intake</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setCreatedPatient(null);
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  dateOfBirth: '',
                  gender: 'MALE',
                  bloodGroup: 'B+',
                  address: '',
                  emergencyContact: '',
                  hospitalId: activeHospitalId || 1,
                });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-border hover:bg-accent text-foreground transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Another</span>
            </button>
          </div>
        </div>
      ) : (
        /* Registration Form */
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-6">
          {/* Section 1: Demographics */}
          <div>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#007b92]" />
              Basic Patient Identity
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  placeholder="e.g. Rahul"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  placeholder="e.g. Sharma"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Hospital Branch <span className="text-red-500">*</span>
                </label>
                <select
                  name="hospitalId"
                  value={formData.hospitalId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} {h.city ? `(${h.city})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div className="pt-4 border-t border-border">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#007b92]" />
              Contact & Emergency Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="patient@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-foreground mb-1">
                  Emergency Contact (Name & Phone)
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  placeholder="e.g. Ramesh Sharma (Father) - +91 9123456780"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-foreground mb-1">
                  Residential Address
                </label>
                <textarea
                  rows={2}
                  name="address"
                  placeholder="Street, City, District, State, PIN"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <Link
              href="/staff/reception/patients"
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-border hover:bg-accent text-foreground transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#007b92] text-white hover:bg-[#00667a] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Registering & Generating MRN...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Patient</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
