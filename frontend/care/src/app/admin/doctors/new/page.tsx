'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, RefreshCw, AlertCircle, Building2, Stethoscope, User, 
  Calendar, Phone, Mail, BadgeCheck, FileText, IndianRupee, ChevronDown,
  CheckCircle2, ShieldCheck, Clock, KeyRound, Sparkles, X
} from 'lucide-react';
import Link from 'next/link';

interface OnboardingResponseData {
  doctorId: number;
  userId: number;
  email: string;
  fullName: string;
  hospitalName: string;
  departmentName: string;
  engagement: string;
  emailVerified: boolean;
  accountCreated: boolean;
  profileCreated: boolean;
  assignmentCreated: boolean;
  welcomeEmailStatus: string;
  message: string;
}

export default function RegisterDoctorPage() {
  const router = useRouter();
  
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [otpExpirySeconds, setOtpExpirySeconds] = useState(300); // 5 minutes
  const [resending, setResending] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Success Completion State
  const [completedDoctor, setCompletedDoctor] = useState<OnboardingResponseData | null>(null);
  
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
    designation: 'Consultant',
    publicAppointmentEnabled: false,
    inHouseClinicalEnabled: true
  });

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

  // Cooldown & Expiry countdown timers for OTP modal
  useEffect(() => {
    if (!showOtpModal) return;

    const timer = setInterval(() => {
      setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
      setOtpExpirySeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [showOtpModal]);

  // Auto-focus OTP input when modal opens
  useEffect(() => {
    if (showOtpModal) {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    }
  }, [showOtpModal]);

  const registerDepartments = useMemo(() => {
    if (!registerForm.hospitalId) return [];
    const hId = parseInt(registerForm.hospitalId);
    return departments.filter(d => d.hospitalId === hId);
  }, [registerForm.hospitalId, departments]);

  // Phase 2: Form validation & initiate onboarding
  async function handleRegisterDoctor(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!registerForm.firstName.trim() || !registerForm.lastName.trim() || !registerForm.email.trim()) {
      setError('Please fill in all required personal identity fields.');
      return;
    }

    if (!registerForm.publicAppointmentEnabled && !registerForm.inHouseClinicalEnabled) {
      setError('Select at least one doctor engagement option (Public Appointment or In-House Clinical).');
      return;
    }

    setSubmitting(true);

    try {
      const initiatePayload = {
        firstName: registerForm.firstName.trim(),
        lastName: registerForm.lastName.trim(),
        email: registerForm.email.trim().toLowerCase(),
        phone: registerForm.phone ? registerForm.phone.trim() : null,
        gender: registerForm.gender || null,
        dateOfBirth: registerForm.dateOfBirth || null,
        specialization: registerForm.specialization.trim() || null,
        qualifications: registerForm.qualifications.trim() || null,
        experienceYears: registerForm.experienceYears ? parseInt(registerForm.experienceYears) : null,
        registrationNumber: registerForm.registrationNumber.trim() || null,
        defaultConsultationFee: registerForm.defaultConsultationFee ? parseFloat(registerForm.defaultConsultationFee) : null,
        bio: registerForm.bio.trim() || null,
        hospitalId: registerForm.hospitalId ? parseInt(registerForm.hospitalId) : null,
        departmentId: registerForm.departmentId ? parseInt(registerForm.departmentId) : null,
        designation: registerForm.designation.trim() || 'Consultant',
        publicAppointmentEnabled: registerForm.publicAppointmentEnabled,
        inHouseClinicalEnabled: registerForm.inHouseClinicalEnabled
      };

      const initiateRes = await fetch('/api/proxy/api/v1/doctors/onboarding/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initiatePayload)
      });

      const resData = await initiateRes.json().catch(() => null);

      if (!initiateRes.ok) {
        let msg = resData?.message || 'Failed to initiate doctor onboarding verification.';
        if (initiateRes.status === 409 || resData?.code === 'DUPLICATE_RESOURCE') {
          msg = `An account or doctor with email "${registerForm.email}" already exists.`;
        }
        setError(msg);
        setSubmitting(false);
        return;
      }

      // Success: Open OTP Verification Modal
      setOtp('');
      setOtpError(null);
      setResendCooldown(60);
      setOtpExpirySeconds(300);
      setShowOtpModal(true);
      setSubmitting(false);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during onboarding.');
      setSubmitting(false);
    }
  }

  // Phase 17: Resend OTP
  async function handleResendOtp() {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setOtpError(null);

    try {
      const res = await fetch('/api/proxy/api/v1/doctors/onboarding/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registerForm.email.trim().toLowerCase() })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to resend verification code.');
      }

      setResendCooldown(60);
      setOtpExpirySeconds(300);
    } catch (err: any) {
      setOtpError(err.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  }

  // Phase 5, 7, 9: Verify OTP & Complete Onboarding
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setOtpError('Please enter a valid 6-digit verification code.');
      return;
    }

    setOtpSubmitting(true);
    setOtpError(null);

    try {
      const completePayload = {
        firstName: registerForm.firstName.trim(),
        lastName: registerForm.lastName.trim(),
        email: registerForm.email.trim().toLowerCase(),
        phone: registerForm.phone ? registerForm.phone.trim() : null,
        gender: registerForm.gender || null,
        dateOfBirth: registerForm.dateOfBirth || null,
        specialization: registerForm.specialization.trim() || null,
        qualifications: registerForm.qualifications.trim() || null,
        experienceYears: registerForm.experienceYears ? parseInt(registerForm.experienceYears) : null,
        registrationNumber: registerForm.registrationNumber.trim() || null,
        defaultConsultationFee: registerForm.defaultConsultationFee ? parseFloat(registerForm.defaultConsultationFee) : null,
        bio: registerForm.bio.trim() || null,
        hospitalId: registerForm.hospitalId ? parseInt(registerForm.hospitalId) : null,
        departmentId: registerForm.departmentId ? parseInt(registerForm.departmentId) : null,
        designation: registerForm.designation.trim() || 'Consultant',
        publicAppointmentEnabled: registerForm.publicAppointmentEnabled,
        inHouseClinicalEnabled: registerForm.inHouseClinicalEnabled,
        otp: otp.trim()
      };

      const completeRes = await fetch('/api/proxy/api/v1/doctors/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completePayload)
      });

      const resJson = await completeRes.json().catch(() => null);

      if (!completeRes.ok) {
        let msg = resJson?.message || 'Failed to complete doctor onboarding.';
        if (msg.includes('Invalid') || resJson?.code === 'INVALID_ARGUMENT') {
          msg = 'Invalid verification code.';
        } else if (msg.includes('expired')) {
          msg = 'Verification code expired. Request a new code.';
        } else if (msg.includes('Too many attempts')) {
          msg = 'Too many attempts. Please request a new verification code.';
        }
        throw new Error(msg);
      }

      // Success!
      setShowOtpModal(false);
      setCompletedDoctor(resJson.data);

    } catch (err: any) {
      console.error('OTP Verification error:', err);
      setOtpError(err.message || 'Invalid verification code.');
    } finally {
      setOtpSubmitting(false);
    }
  }

  function handleResetForm() {
    setCompletedDoctor(null);
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
      designation: 'Consultant',
      publicAppointmentEnabled: false,
      inHouseClinicalEnabled: true
    });
    setError(null);
    setOtp('');
    setOtpError(null);
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Phase 9: Onboarding Completion View
  if (completedDoctor) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-6">
        <div className="bg-card border border-border rounded-2xl shadow-sm p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-[#007b92]/10 text-[#007b92] rounded-full flex items-center justify-center mx-auto ring-8 ring-[#007b92]/5">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Onboarding Complete
            </span>
            <h1 className="text-2xl font-bold text-card-foreground">Doctor Onboarded Successfully</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              The doctor account is verified, provisioned, and ready for clinical access.
            </p>
          </div>

          <div className="bg-background/80 border border-border rounded-xl p-6 text-left max-w-lg mx-auto space-y-3.5">
            <div className="border-b border-border/60 pb-3">
              <div className="text-lg font-bold text-card-foreground">{completedDoctor.fullName}</div>
              <div className="text-sm text-muted-foreground">{completedDoctor.email}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block mb-0.5 font-medium">Hospital</span>
                <span className="text-card-foreground font-semibold">{completedDoctor.hospitalName || 'Primary Facility'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5 font-medium">Department</span>
                <span className="text-card-foreground font-semibold">{completedDoctor.departmentName || 'General Practice'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block mb-0.5 font-medium">Engagement Mode</span>
                <span className="text-card-foreground font-semibold">{completedDoctor.engagement}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 space-y-2">
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Doctor Email verified</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>IAM Account provisioned (Role: DOCTOR)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Professional profile & medical qualifications saved</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Hospital & department assignment linked</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#007b92] font-medium">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>
                  Welcome email: {completedDoctor.welcomeEmailStatus === 'SENT' ? 'Sent to doctor inbox' : 'Queued for delivery'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/admin/doctors"
              className="px-6 py-2.5 bg-[#007b92] text-white rounded-xl text-sm font-medium hover:bg-[#006072] transition shadow-sm"
            >
              View Doctor Directory
            </Link>
            <button
              onClick={handleResetForm}
              className="px-5 py-2.5 border border-border bg-background rounded-xl text-sm font-medium hover:bg-accent transition shadow-sm"
            >
              Register Another Doctor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Register New Doctor</h1>
          <p className="text-muted-foreground mt-1">Creates IAM account, doctor identity, professional profile & hospital assignment</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleRegisterDoctor} className="space-y-6 pb-8">
        {/* Section 1: Core Identity */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#007b92]">
              <User className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">1. Personal & Identity</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">First Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    value={registerForm.firstName}
                    onChange={e => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                    placeholder="e.g. Ramesh"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Last Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={registerForm.lastName}
                  onChange={e => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                  placeholder="e.g. Kumar"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={registerForm.email}
                    onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                    placeholder="doctor@swarnikacare.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input 
                    type="tel" 
                    value={registerForm.phone}
                    onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Gender</label>
                <div className="relative">
                  <select
                    value={registerForm.gender}
                    onChange={e => setRegisterForm({ ...registerForm, gender: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition appearance-none"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Date of Birth</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input 
                    type="date" 
                    value={registerForm.dateOfBirth}
                    onChange={e => setRegisterForm({ ...registerForm, dateOfBirth: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Professional Profile */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#007b92]">
              <Stethoscope className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">2. Professional Profile</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Specialization</label>
                <input 
                  type="text" 
                  value={registerForm.specialization}
                  onChange={e => setRegisterForm({ ...registerForm, specialization: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                  placeholder="e.g. Cardiology, Surgery"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Qualifications</label>
                <input 
                  type="text" 
                  value={registerForm.qualifications}
                  onChange={e => setRegisterForm({ ...registerForm, qualifications: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                  placeholder="e.g. MBBS, MD, MS"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Medical Registration Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    value={registerForm.registrationNumber}
                    onChange={e => setRegisterForm({ ...registerForm, registrationNumber: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                    placeholder="e.g. MCI-2024-98765"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Experience (Years)</label>
                <input 
                  type="number" 
                  min="0"
                  value={registerForm.experienceYears}
                  onChange={e => setRegisterForm({ ...registerForm, experienceYears: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                  placeholder="e.g. 10"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Consultation Fee (₹)</label>
                <div className="relative max-w-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <input 
                    type="number" 
                    min="0"
                    step="50"
                    value={registerForm.defaultConsultationFee}
                    onChange={e => setRegisterForm({ ...registerForm, defaultConsultationFee: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                    placeholder="e.g. 800"
                  />
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Doctor Bio</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 flex items-start pointer-events-none text-muted-foreground">
                    <FileText className="w-4 h-4" />
                  </div>
                  <textarea 
                    rows={3}
                    value={registerForm.bio}
                    onChange={e => setRegisterForm({ ...registerForm, bio: e.target.value })}
                    className="w-full pl-9 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition resize-y"
                    placeholder="Brief overview of clinical practice and clinical interests..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Hospital & Department Assignment */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#007b92]">
              <Building2 className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">3. Primary Hospital Assignment (Optional)</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 bg-background/50 p-5 rounded-2xl border border-border/50">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Hospital</label>
                <div className="relative">
                  <select
                    value={registerForm.hospitalId}
                    onChange={e => setRegisterForm({ ...registerForm, hospitalId: e.target.value, departmentId: '' })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition appearance-none"
                  >
                    <option value="">Select Hospital</option>
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id.toString()}>{h.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Department</label>
                <div className="relative">
                  <select
                    disabled={!registerForm.hospitalId}
                    value={registerForm.departmentId}
                    onChange={e => setRegisterForm({ ...registerForm, departmentId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition appearance-none disabled:opacity-50"
                  >
                    <option value="">Select Department</option>
                    {registerDepartments.map(d => (
                      <option key={d.id} value={d.id.toString()}>{d.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Designation</label>
                <div className="relative">
                  <select
                    value={registerForm.designation}
                    onChange={e => setRegisterForm({ ...registerForm, designation: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition appearance-none"
                  >
                    <option value="Consultant">Consultant</option>
                    <option value="Senior Consultant">Senior Consultant</option>
                    <option value="Visiting Consultant">Visiting Consultant</option>
                    <option value="Junior Resident">Junior Resident</option>
                    <option value="Senior Resident">Senior Resident</option>
                    <option value="HOD">HOD</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Doctor Engagement */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#007b92]">
              <Stethoscope className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">4. Doctor Engagement</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">How should this doctor be used at this hospital?</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={registerForm.publicAppointmentEnabled}
                  onChange={e => setRegisterForm({ ...registerForm, publicAppointmentEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-[#007b92] focus:ring-[#007b92]"
                />
                <span className="text-sm font-medium">Public Appointment Doctor</span>
              </label>
              <label className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={registerForm.inHouseClinicalEnabled}
                  onChange={e => setRegisterForm({ ...registerForm, inHouseClinicalEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-[#007b92] focus:ring-[#007b92]"
                />
                <span className="text-sm font-medium">In-House Clinical Doctor</span>
              </label>
            </div>
          </div>
        </div>

        {/* Form Footer */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-8">
          <Link
            href="/admin/doctors"
            className="px-5 py-2.5 border border-border bg-background rounded-xl text-sm font-medium hover:bg-accent transition shadow-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#007b92] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#006072] transition shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
            Register Doctor
          </button>
        </div>
      </form>

      {/* Phase 4: OTP Verification Dialog Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative">
            <button 
              onClick={() => setShowOtpModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#007b92]/10 text-[#007b92] flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground">Verify Doctor Email</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A 6-digit verification code has been sent to:
              </p>
              <p className="text-sm font-semibold text-[#007b92] bg-[#007b92]/5 py-1 px-3 rounded-lg inline-block break-all">
                {registerForm.email}
              </p>
            </div>

            {otpError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 text-center">
                  Enter 6-Digit OTP
                </label>
                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3.5 px-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Expires in: <strong className="font-mono text-card-foreground">{formatTimer(otpExpirySeconds)}</strong>
                  </span>
                </div>

                <div>
                  {resendCooldown > 0 ? (
                    <span className="text-muted-foreground">
                      Resend in <strong className="font-mono">{formatTimer(resendCooldown)}</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resending}
                      className="text-[#007b92] hover:underline font-semibold flex items-center gap-1"
                    >
                      {resending && <RefreshCw className="w-3 h-3 animate-spin" />}
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 px-4 py-2.5 border border-border bg-background rounded-xl text-sm font-medium hover:bg-accent transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otpSubmitting || otp.length !== 6 || otpExpirySeconds <= 0}
                  className="flex-1 bg-[#007b92] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#006072] transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {otpSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Verify Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
