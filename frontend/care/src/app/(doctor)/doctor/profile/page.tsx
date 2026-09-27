'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Clock,
  Briefcase,
  GraduationCap,
  Globe,
  Stethoscope,
  BadgeCheck,
  Copy,
  Check,
  Star,
  Activity,
  AlertCircle,
  FileBadge,
  ShieldCheck
} from 'lucide-react';

interface DoctorAssignment {
  id: number;
  doctorId: number;
  hospitalId: number;
  departmentId: number;
  designation: string;
  status: string;
  publicAppointmentEnabled: boolean;
  inHouseClinicalEnabled: boolean;
  hospitalName?: string;
  departmentName?: string;
  hospitalAddress?: string;
}

interface DoctorDirectoryProfile {
  id: number;
  userId: string;
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
  profileStatus?: string;
  defaultConsultationFee?: number;
  assignments?: DoctorAssignment[];
}

interface AvailabilitySlot {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  hospitalId: number;
  departmentId: number;
}

const DAY_ORDER: Record<string, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7
};

export default function DoctorProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<DoctorDirectoryProfile | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'hospitals' | 'schedule' | 'security'>('overview');
  const [copied, setCopied] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch current doctor identity
      const meRes = await fetch('/api/proxy/api/v1/doctors/me');
      if (!meRes.ok) throw new Error('Failed to verify doctor authentication session');
      const meJson = await meRes.json();
      const doc = meJson.data;

      // 2. Fetch hospital & department directories for friendly resolution
      const [hospRes, deptRes] = await Promise.all([
        fetch('/api/proxy/api/v1/hospitals').catch(() => null),
        fetch('/api/proxy/api/v1/departments').catch(() => null),
      ]);

      const hospitalMap = new Map<number, { name: string; address: string }>();
      if (hospRes && hospRes.ok) {
        const hospJson = await hospRes.json();
        (hospJson.data || []).forEach((h: any) => {
          hospitalMap.set(h.id, { name: h.name, address: h.address || h.city || '' });
        });
      }

      const deptMap = new Map<number, string>();
      if (deptRes && deptRes.ok) {
        const deptJson = await deptRes.json();
        (deptJson.data || []).forEach((d: any) => {
          deptMap.set(d.id, d.name);
        });
      }

      // 3. Fetch comprehensive profile from directory
      let fullDoctor: DoctorDirectoryProfile = doc;
      const dirRes = await fetch(`/api/proxy/api/v1/doctors/directory?search=${encodeURIComponent(doc.email)}`);
      if (dirRes.ok) {
        const dirJson = await dirRes.json();
        const found = (dirJson.data || []).find((d: any) => d.id === doc.id || d.email === doc.email);
        if (found) {
          fullDoctor = found;
        }
      }

      // Enrich assignments with resolved hospital and department names
      if (fullDoctor.assignments && fullDoctor.assignments.length > 0) {
        fullDoctor.assignments = fullDoctor.assignments.map(asgn => ({
          ...asgn,
          hospitalName: hospitalMap.get(asgn.hospitalId)?.name || `Hospital #${asgn.hospitalId}`,
          hospitalAddress: hospitalMap.get(asgn.hospitalId)?.address || '',
          departmentName: deptMap.get(asgn.departmentId) || `Department #${asgn.departmentId}`,
        }));
      }

      setDoctor(fullDoctor);

      // 4. Fetch schedule slots
      if (doc.id) {
        const availRes = await fetch(`/api/proxy/api/v1/doctors/${doc.id}/availability`);
        if (availRes.ok) {
          const availJson = await availRes.json();
          setAvailabilitySlots(availJson.data || []);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error loading doctor profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCopyEmail = () => {
    if (!doctor?.email) return;
    navigator.clipboard.writeText(doctor.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (timeStr: string) => {
    try {
      const parts = timeStr.split(':');
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  // Extract specializations from actual backend data only
  const specializationsList = (doctor?.specialization || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  // Sort slots by day of week
  const sortedSlots = [...availabilitySlots].sort((a, b) => {
    const orderA = DAY_ORDER[a.dayOfWeek.toUpperCase()] || 99;
    const orderB = DAY_ORDER[b.dayOfWeek.toUpperCase()] || 99;
    return orderA - orderB;
  });

  return (
    <div className="space-y-3.5 max-w-6xl mx-auto pb-4">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>Doctor Console</span>
            <span>/</span>
            <span className="text-foreground font-semibold">Doctor Profile</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Doctor Profile & Credentials
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/doctor/schedule"
            className="inline-flex items-center gap-2 rounded-xl bg-[#007b92] hover:bg-[#006073] text-white px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Manage OPD Schedule</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-64 bg-card border border-border rounded-2xl animate-pulse" />
          <div className="h-96 bg-card border border-border rounded-2xl animate-pulse" />
        </div>
      ) : error || !doctor ? (
        <div className="p-8 text-center rounded-2xl border border-red-500/20 bg-red-500/10">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error || 'Profile not found'}</p>
          <button
            onClick={fetchProfile}
            className="mt-4 px-4 py-1.5 text-xs font-semibold bg-background border border-border rounded-lg hover:bg-accent transition"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Executive Doctor Header Card (Compact & Modern) */}
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                {/* Doctor Avatar + Details */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
                  {/* Circular Rounded Avatar with Status Indicator */}
                  <div className="relative shrink-0">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-[#007b92] to-[#005262] text-white font-bold text-xl sm:text-2xl flex items-center justify-center shadow-md ring-3 ring-background">
                      {doctor.firstName?.charAt(0)}
                      {doctor.lastName?.charAt(0)}
                    </div>
                    {/* Active practitioner status dot */}
                    {doctor.status === 'ACTIVE' && (
                      <span
                        className="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-background flex items-center justify-center"
                        title="Active Doctor"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      </span>
                    )}
                  </div>

                  {/* Doctor Info */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h2>
                      {doctor.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <BadgeCheck className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>

                    {/* Specialization & Qualifications */}
                    {(doctor.specialization || doctor.qualifications) && (
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm">
                        {doctor.specialization && (
                          <span className="font-semibold text-[#007b92] dark:text-[#38bdf8] flex items-center gap-1">
                            <Stethoscope className="w-3.5 h-3.5 shrink-0" />
                            {doctor.specialization}
                          </span>
                        )}
                        {doctor.specialization && doctor.qualifications && (
                          <span className="text-muted-foreground hidden sm:inline">•</span>
                        )}
                        {doctor.qualifications && (
                          <span className="text-muted-foreground font-medium">
                            {doctor.qualifications}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Primary Hospital Branch (real data only) */}
                    {doctor.assignments && doctor.assignments.length > 0 && (
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-[#007b92]" />
                          <span>{doctor.assignments[0].hospitalName}</span>
                        </span>
                        {doctor.assignments[0].hospitalAddress && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>{doctor.assignments[0].hospitalAddress}</span>
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Contact row (real data only, no hardcoded fallbacks) */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-muted-foreground pt-0.5">
                      {doctor.email && (
                        <button
                          onClick={handleCopyEmail}
                          className="inline-flex items-center gap-1.5 font-mono hover:text-foreground transition group cursor-pointer"
                          title="Click to copy email"
                        >
                          <Mail className="h-3.5 w-3.5 text-muted-foreground group-hover:text-[#007b92]" />
                          <span>{doctor.email}</span>
                          {copied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
                          )}
                        </button>
                      )}

                      {doctor.phone && (
                        <span className="inline-flex items-center gap-1.5 font-mono">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>+91 {doctor.phone}</span>
                        </span>
                      )}

                      {doctor.registrationNumber && (
                        <span className="inline-flex items-center gap-1.5">
                          <FileBadge className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Reg No: <strong className="font-mono text-foreground">{doctor.registrationNumber}</strong></span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Key Highlights (Compact & Clean) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-col gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-border md:pl-5">
                  {doctor.experienceYears != null && (
                    <div className="bg-muted/40 rounded-lg p-2 px-3 border border-border/50">
                      <div className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-[#007b92]" />
                        <span>Experience</span>
                      </div>
                      <div className="text-sm font-bold text-foreground mt-0.5">
                        {doctor.experienceYears} Years
                      </div>
                    </div>
                  )}

                  {doctor.defaultConsultationFee != null && (
                    <div className="bg-muted/40 rounded-lg p-2 px-3 border border-border/50">
                      <div className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" />
                        <span>OPD Fee</span>
                      </div>
                      <div className="text-sm font-bold text-foreground mt-0.5">
                        ₹{doctor.defaultConsultationFee.toFixed(0)}
                        <span className="text-[10px] font-normal text-muted-foreground"> / visit</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-muted/40 rounded-lg p-2 px-3 border border-border/50 col-span-2 sm:col-span-1">
                    <div className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                      <Activity className="w-3 h-3 text-emerald-500" />
                      <span>OPD Sessions</span>
                    </div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {availabilitySlots.length} Active {availabilitySlots.length === 1 ? 'Day' : 'Days'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Segmented Navigation Tabs (Compact) */}
            <div className="flex border-t border-border bg-muted/20 px-4 sm:px-6 overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2.5 px-3.5 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'border-[#007b92] text-[#007b92] dark:text-[#38bdf8] bg-background/50'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Overview & Bio</span>
              </button>

              <button
                onClick={() => setActiveTab('hospitals')}
                className={`py-2.5 px-3.5 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'hospitals'
                    ? 'border-[#007b92] text-[#007b92] dark:text-[#38bdf8] bg-background/50'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Hospital Attachments ({doctor.assignments?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('schedule')}
                className={`py-2.5 px-3.5 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'schedule'
                    ? 'border-[#007b92] text-[#007b92] dark:text-[#38bdf8] bg-background/50'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>OPD Hours ({availabilitySlots.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`py-2.5 px-3.5 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'security'
                    ? 'border-[#007b92] text-[#007b92] dark:text-[#38bdf8] bg-background/50'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Account & Access</span>
              </button>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & CLINICAL DETAILS */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
              {/* Left 2 Columns: Bio, Specializations, Qualifications */}
              <div className="lg:col-span-2 flex flex-col justify-between gap-4">
                {/* About & Clinical Focus Card */}
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <User className="w-4 h-4 text-[#007b92]" />
                      <span>About Dr. {doctor.firstName} {doctor.lastName}</span>
                    </h3>
                    {doctor.bio ? (
                      <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                        {doctor.bio}
                      </p>
                    ) : (
                      <p className="text-xs italic text-muted-foreground/70">
                        No professional bio added yet.
                      </p>
                    )}
                  </div>

                  {specializationsList.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <div className="text-[11px] font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-[#007b92]" />
                        <span>Clinical Specializations</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {specializationsList.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 px-2.5 py-1 text-xs font-medium text-foreground"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#007b92]" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Qualifications & Medical Registration Card */}
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2.5">
                    <GraduationCap className="w-4 h-4 text-[#007b92]" />
                    <span>Qualifications & Registration</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/30 border border-border/40">
                      <div className="p-1.5 rounded-lg bg-[#007b92]/10 text-[#007b92] shrink-0">
                        <GraduationCap className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground truncate">
                          {doctor.qualifications || 'MBBS'}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          Medical Qualifications
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/30 border border-border/40">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                        <FileBadge className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground truncate">
                          {doctor.registrationNumber ? `Reg: ${doctor.registrationNumber}` : 'Council Verified'}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          Medical Registration
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Practice Summary & Next Shift */}
              <div className="flex flex-col justify-between gap-4">
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                      Practice Summary
                    </h3>

                    <div className="space-y-2 text-xs">
                      {doctor.assignments?.[0]?.designation && (
                        <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                          <span className="text-muted-foreground font-medium">Designation</span>
                          <span className="font-bold text-foreground">
                            {doctor.assignments[0].designation}
                          </span>
                        </div>
                      )}

                      {doctor.assignments?.[0]?.departmentName && (
                        <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                          <span className="text-muted-foreground font-medium">Department</span>
                          <span className="font-bold text-[#007b92]">
                            {doctor.assignments[0].departmentName}
                          </span>
                        </div>
                      )}

                      {doctor.defaultConsultationFee != null && (
                        <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                          <span className="text-muted-foreground font-medium">OPD Consultation Fee</span>
                          <span className="font-bold text-foreground">
                            ₹{doctor.defaultConsultationFee.toFixed(0)}
                          </span>
                        </div>
                      )}

                      {doctor.assignments?.[0] && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground font-medium">Clinical Authorization</span>
                          <span className={`inline-flex items-center gap-1 font-semibold ${
                            doctor.assignments[0].inHouseClinicalEnabled
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-muted-foreground'
                          }`}>
                            <span>{doctor.assignments[0].inHouseClinicalEnabled ? 'Authorized' : 'Inactive'}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Consultation Hours Summary Widget */}
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#007b92]" />
                      <span>Next Available OPD</span>
                    </h3>
                    <Link
                      href="/doctor/schedule"
                      className="text-[11px] font-semibold text-[#007b92] hover:underline"
                    >
                      View All
                    </Link>
                  </div>

                  {sortedSlots.length > 0 ? (
                    <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs space-y-0.5">
                      <div className="font-bold text-teal-800 dark:text-teal-300">
                        {sortedSlots[0].dayOfWeek} Shift
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        {formatTime(sortedSlots[0].startTime)} – {formatTime(sortedSlots[0].endTime)}
                      </div>
                      {doctor.assignments?.[0]?.hospitalName && (
                        <div className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">
                          {doctor.assignments[0].hospitalName}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No regular OPD shifts configured.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOSPITAL ATTACHMENTS */}
          {activeTab === 'hospitals' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#007b92]" />
                    <span>Hospital Attachments & Clinical Appointments</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Authorized hospital units, clinical departments, and appointment booking channels.
                  </p>
                </div>
                <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg self-start sm:self-auto">
                  {doctor.assignments?.length || 0} Facility {doctor.assignments?.length === 1 ? 'Attachment' : 'Attachments'}
                </span>
              </div>

              {doctor.assignments && doctor.assignments.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {doctor.assignments.map((asgn) => (
                    <div
                      key={asgn.id}
                      className="p-5 rounded-xl border border-border bg-background/50 hover:border-[#007b92]/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-bold text-base text-foreground">
                            {asgn.hospitalName}
                          </span>
                          <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {asgn.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">{asgn.departmentName}</span>
                          {asgn.hospitalAddress && (
                            <>
                              <span>•</span>
                              <span>{asgn.hospitalAddress}</span>
                            </>
                          )}
                        </div>

                        {asgn.designation && (
                          <div className="text-xs text-muted-foreground pt-1">
                            Role: <strong className="text-foreground">{asgn.designation}</strong>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {asgn.inHouseClinicalEnabled && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300">
                            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                            <span>In-House OPD Privileges</span>
                          </span>
                        )}

                        {asgn.publicAppointmentEnabled && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                            <Globe className="h-3.5 w-3.5 text-blue-600" />
                            <span>Public Booking Active</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border">
                  No active hospital assignments recorded.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OPD SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#007b92]" />
                    <span>Weekly OPD Consultation Timings</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pre-configured consultation shift hours available for patient scheduling.
                  </p>
                </div>

                <Link
                  href="/doctor/schedule"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007b92] dark:text-[#38bdf8] hover:underline"
                >
                  <span>Edit in Calendar Schedule</span>
                </Link>
              </div>

              {sortedSlots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-4 rounded-xl border border-border bg-background/50 flex flex-col justify-between gap-3 hover:border-[#007b92]/40 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#007b92] dark:text-[#38bdf8]">
                          {slot.dayOfWeek}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>Active</span>
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-base font-bold text-foreground">
                          {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          OPD Consultation Shift
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border space-y-2">
                  <p>No active OPD time slots found for this doctor.</p>
                  <Link
                    href="/doctor/schedule"
                    className="inline-block px-4 py-2 bg-[#007b92] text-white text-xs font-semibold rounded-lg hover:bg-[#006073] transition"
                  >
                    Add Schedule Slots
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACCOUNT & SECURITY */}
          {activeTab === 'security' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
              <div className="border-b border-border/60 pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#007b92]" />
                  <span>Account & Authentication Credentials</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-background/50 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Doctor ID</label>
                  <div className="text-sm font-mono font-bold text-foreground">{doctor.id}</div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-background/50 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">IAM User ID</label>
                  <div className="text-sm font-mono font-bold text-foreground">{doctor.userId}</div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-background/50 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Registered Login Email</label>
                  <div className="text-sm font-mono font-bold text-foreground">{doctor.email}</div>
                </div>

                {doctor.phone && (
                  <div className="p-4 rounded-xl border border-border bg-background/50 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
                    <div className="text-sm font-mono font-bold text-foreground">+91 {doctor.phone}</div>
                  </div>
                )}

                {doctor.gender && (
                  <div className="p-4 rounded-xl border border-border bg-background/50 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Gender</label>
                    <div className="text-sm font-bold text-foreground">{doctor.gender}</div>
                  </div>
                )}

                {doctor.dateOfBirth && (
                  <div className="p-4 rounded-xl border border-border bg-background/50 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Date of Birth</label>
                    <div className="text-sm font-bold text-foreground">{doctor.dateOfBirth}</div>
                  </div>
                )}

                <div className="p-4 rounded-xl border border-border bg-background/50 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Practitioner Status</label>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {doctor.status}
                  </div>
                </div>

                {doctor.profileStatus && (
                  <div className="p-4 rounded-xl border border-border bg-background/50 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Profile Publication Status</label>
                    <div className="text-sm font-bold text-foreground">{doctor.profileStatus}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
