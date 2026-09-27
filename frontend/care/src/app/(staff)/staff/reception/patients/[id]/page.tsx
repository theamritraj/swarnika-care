'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useReceptionSidebar } from '../../components/ReceptionSidebarContext';
import {
  Users,
  ArrowLeft,
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
  FileText,
  Upload,
  CreditCard,
  Clock,
  Eye,
  Check,
  Plus
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

interface PatientDocument {
  id: number;
  documentNumber: string;
  patientId: number;
  hospitalId: number;
  documentType: string;
  documentName: string;
  fileUrl: string;
  status: string;
  receivedDate: string;
  verifiedBy?: string;
  notes?: string;
  createdAt: string;
}

interface Appointment {
  id: number;
  appointmentNumber: string;
  hospitalId: number;
  departmentId: number;
  doctorId: number;
  doctorName?: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  appointmentType: string;
  consultationFee?: number;
  paymentStatus?: string;
}

export default function PatientAdminDetailView({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const patientId = Number(resolvedParams.id);
  const router = useRouter();
  const { activeHospitalId } = useReceptionSidebar();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalRegistrations, setHospitalRegistrations] = useState<HospitalRegistration[]>([]);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Demographic Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editEmergencyContact, setEditEmergencyContact] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Document Upload Modal
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docType, setDocType] = useState('NATIONAL_ID_PROOF');
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docNotes, setDocNotes] = useState('');
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch patient
      const pRes = await fetch(`/api/patients/${patientId}`);
      if (!pRes.ok) throw new Error('Patient not found');
      const pData = await pRes.json();
      const p = pData.data || pData;
      setPatient(p);
      setEditPhone(p.phone || '');
      setEditEmail(p.email || '');
      setEditAddress(p.address || '');
      setEditEmergencyContact(p.emergencyContact || '');

      // 2. Fetch hospitals & registrations
      const [hospRes, regRes] = await Promise.all([
        fetch('/api/v1/hospitals'),
        fetch(`/api/v1/patients/${patientId}/registrations`)
      ]);

      let hospList: Hospital[] = [];
      if (hospRes.ok) {
        const hJson = await hospRes.json();
        hospList = hJson.data || hJson || [];
        setHospitals(hospList);
      }

      if (regRes.ok) {
        const rJson = await regRes.json();
        const rList = rJson.data || rJson || [];
        setHospitalRegistrations(
          rList.map((r: HospitalRegistration) => ({
            ...r,
            hospitalName: hospList.find((h) => h.id === r.hospitalId)?.name || `Hospital #${r.hospitalId}`
          }))
        );
      }

      // 3. Fetch documents
      const docRes = await fetch(`/api/v1/patients/${patientId}/documents`);
      if (docRes.ok) {
        const dJson = await docRes.json();
        setDocuments(dJson.data || []);
      }

      // 4. Fetch appointments for this patient
      const apptRes = await fetch(`/api/v1/appointments?patientId=${patientId}`);
      if (apptRes.ok) {
        const aJson = await apptRes.json();
        const aList = aJson.data || aJson || [];
        setAppointments(aList);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load patient administrative details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      loadData();
    }
  }, [patientId]);

  const handleUpdateDemographics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    setIsSubmittingEdit(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/patients/${patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: editEmail || patient.email,
          phone: editPhone || patient.phone,
          address: editAddress,
          emergencyContact: editEmergencyContact
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to update demographics');
      }

      setSuccessMessage('Administrative demographics updated successfully');
      setIsEditModalOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update demographics');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !docName.trim()) return;
    setIsSubmittingDoc(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/patients/${patient.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: activeHospitalId || 101,
          documentType: docType,
          documentName: docName,
          fileUrl: docUrl || `https://documents.swarnikacare.internal/docs/${patient.id}/${Date.now()}`,
          notes: docNotes
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to upload document');
      }

      setSuccessMessage('Administrative document added successfully');
      setIsDocModalOpen(false);
      setDocName('');
      setDocUrl('');
      setDocNotes('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  const handleVerifyDocument = async (docId: number) => {
    try {
      const res = await fetch(`/api/v1/patients/${patientId}/documents/${docId}/verify`, {
        method: 'PATCH'
      });
      if (!res.ok) throw new Error('Verification failed');
      setSuccessMessage('Document verified successfully');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to verify document');
    }
  };

  const handleRegisterHospital = async (hospId: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/v1/patients/${patientId}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId: hospId })
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to register patient with hospital');
      }
      setSuccessMessage('Patient successfully registered with hospital facility');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to register hospital');
    }
  };

  const isRegisteredAtActiveHospital = hospitalRegistrations.some(
    (r) => r.hospitalId === activeHospitalId
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-muted-foreground space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#007b92]" />
        <p className="text-sm font-medium">Loading patient administrative file...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Patient Record Not Found</h2>
        <p className="text-xs text-muted-foreground">The requested patient does not exist or has been archived.</p>
        <Link
          href="/staff/reception/patients"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#007b92] text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/staff/reception/patients"
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Back to Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {patient.firstName} {patient.lastName}
              </h1>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">
                {patient.mrn}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comprehensive Front-Desk Administrative Record & Operational Governance
            </p>
          </div>
        </div>

        {/* Operational Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-accent"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Demographics</span>
          </button>

          <Link
            href={`/staff/reception/appointments/new?patientId=${patient.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#007b92] text-white hover:bg-[#00667a]"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </Link>

          <Link
            href={`/staff/reception/walk-in?patientId=${patient.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Fast Walk-in</span>
          </Link>

          <Link
            href={`/staff/reception/admissions?patientId=${patient.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Admit (IPD)</span>
          </Link>

          <Link
            href={`/staff/reception/referrals?patientId=${patient.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-100"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Referral</span>
          </Link>
        </div>
      </div>

      {/* Messages */}
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Demographics & Hospital Registrations */}
        <div className="space-y-6">
          {/* Demographics Card */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#007b92]" />
                <span>Administrative Profile</span>
              </h2>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs text-[#007b92] hover:underline font-semibold flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  Phone Number
                </span>
                <span className="font-semibold text-foreground">{patient.phone || '—'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Email Address
                </span>
                <span className="font-semibold text-foreground">{patient.email || '—'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Date of Birth
                </span>
                <span className="font-semibold text-foreground">{patient.dateOfBirth || '—'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Gender</span>
                <span className="font-semibold text-foreground capitalize">{patient.gender || '—'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Blood Group</span>
                <span className="font-semibold text-foreground">{patient.bloodGroup || '—'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Emergency Contact
                </span>
                <span className="font-semibold text-foreground">{patient.emergencyContact || '—'}</span>
              </div>

              <div className="py-1">
                <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Residential Address
                </span>
                <p className="font-medium text-foreground bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-border/40 text-xs">
                  {patient.address || 'Address not registered'}
                </p>
              </div>
            </div>
          </div>

          {/* Hospital Scope & Registrations */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#007b92]" />
                <span>Hospital Registrations</span>
              </h2>
            </div>

            <div className="space-y-2">
              {hospitalRegistrations.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No hospital registrations on file.</p>
              ) : (
                hospitalRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-slate-50/50 dark:bg-slate-900/40 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-foreground">{reg.hospitalName}</span>
                      <p className="text-[11px] text-muted-foreground">Registered: {reg.registrationDate}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  </div>
                ))
              )}
            </div>

            {!isRegisteredAtActiveHospital && activeHospitalId && (
              <div className="pt-2 border-t border-border/60">
                <button
                  onClick={() => handleRegisterHospital(activeHospitalId)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#007b92] text-white rounded-lg text-xs font-semibold hover:bg-[#00667a] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register at Active Hospital</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Middle & Right: Administrative Documents & Financial/Appointments View */}
        <div className="lg:col-span-2 space-y-6">
          {/* Administrative Documents Coordination */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#007b92]" />
                  <span>Administrative Document Coordination</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ID proofs, insurance cards, referral letters, and consent forms.
                </p>
              </div>

              <button
                onClick={() => setIsDocModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#007b92] text-white rounded-lg text-xs font-semibold hover:bg-[#00667a] transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                <FileText className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs font-semibold text-foreground">No Administrative Documents Registered</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Upload national ID proof, insurance policies, or referral notes for front-desk audit compliance.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3">Doc #</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Document Name</th>
                      <th className="py-2.5 px-3">Received Date</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-accent/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#007b92]">{doc.documentNumber}</td>
                        <td className="py-2.5 px-3 font-medium text-foreground">{doc.documentType.replace(/_/g, ' ')}</td>
                        <td className="py-2.5 px-3 text-foreground">{doc.documentName}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{doc.receivedDate}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              doc.status === 'VERIFIED'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-2">
                          {doc.status !== 'VERIFIED' && (
                            <button
                              onClick={() => handleVerifyDocument(doc.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                            >
                              Verify
                            </button>
                          )}
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-muted-foreground hover:text-foreground inline-flex items-center"
                            title="View Reference"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Operational Appointments & Consultation Fee Visibility */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#007b92]" />
                  <span>Appointments & Consultation Fee Visibility</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Read-only operational finance overview. Receptionist cannot alter bills or create waivers.
                </p>
              </div>
            </div>

            {appointments.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                <Clock className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs font-semibold text-foreground">No Historical or Upcoming Appointments</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Book an appointment using the quick action button above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3">Appt #</th>
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Est. Fee</th>
                      <th className="py-2.5 px-3">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-accent/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#007b92]">
                          {appt.appointmentNumber}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-foreground">
                          {appt.appointmentDate} at {appt.appointmentTime}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-foreground">
                          {appt.appointmentType}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              appt.status === 'CONFIRMED' || appt.status === 'COMPLETED'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                : appt.status === 'CANCELLED'
                                ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                            }`}
                          >
                            {appt.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                          ₹{appt.consultationFee || 500}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {appt.paymentStatus || 'PAYMENT_PENDING'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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

            <form onSubmit={handleUpdateDemographics} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={editEmergencyContact}
                  onChange={(e) => setEditEmergencyContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Residential Address</label>
                <textarea
                  rows={3}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 bg-[#007b92] text-white rounded-lg hover:bg-[#00667a] font-semibold flex items-center gap-1.5"
                >
                  {isSubmittingEdit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setIsDocModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-foreground mb-1">
              Add Administrative Document
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Register government ID proof, insurance policy card, referral slip, or consent documentation.
            </p>

            <form onSubmit={handleUploadDocument} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                >
                  <option value="NATIONAL_ID_PROOF">National ID Proof (Aadhaar / Passport / Voter ID)</option>
                  <option value="INSURANCE_CARD">Insurance Card / TPA Card</option>
                  <option value="REFERRAL_LETTER">Referral Letter / Medical Note</option>
                  <option value="DISCHARGE_SUMMARY">Discharge Summary (External)</option>
                  <option value="CONSENT_FORM">Administrative Consent Form</option>
                  <option value="OTHER">Other Administrative Document</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Document Title / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aadhaar Card - Front & Back"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Reference / Storage URL</label>
                <input
                  type="text"
                  placeholder="https://docs.swarnika.internal/scan-1234.pdf"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Administrative Notes</label>
                <textarea
                  rows={2}
                  placeholder="Optional verification remarks"
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDoc}
                  className="px-4 py-2 bg-[#007b92] text-white rounded-lg hover:bg-[#00667a] font-semibold flex items-center gap-1.5"
                >
                  {isSubmittingDoc && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Upload & Register</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
