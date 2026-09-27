'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  Calendar,
  FileText,
  Clock,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Stethoscope,
  Pill,
  FlaskConical,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Heart
} from 'lucide-react';

interface Patient {
  id: number;
  mrn: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  address?: string;
  status: string;
  createdAt: string;
}

interface Encounter {
  id: number;
  encounterNumber: string;
  doctorId: number;
  patientId: number;
  status: string;
  encounterType: string;
  chiefComplaint?: string;
  primaryDiagnosis?: string;
  secondaryDiagnosis?: string;
  clinicalNotes?: string;
  treatmentPlan?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
}

interface Appointment {
  id: number;
  patientId: number;
  appointmentNumber: string;
  appointmentDate: string;
  startTime: string;
  status: string;
  appointmentType: string;
  reason: string;
}

interface Prescription {
  id: number;
  prescriptionNumber: string;
  encounterId: number;
  notes?: string;
  createdAt: string;
  items: Array<{
    id: number;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    route?: string;
    instructions?: string;
  }>;
}

interface ClinicalOrder {
  id: number;
  orderNumber: string;
  orderType: 'LAB' | 'IMAGING';
  testName: string;
  priority: string;
  clinicalNotes?: string;
  status: string;
  createdAt: string;
}

export default function DoctorPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [orders, setOrders] = useState<ClinicalOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'ENCOUNTERS' | 'APPOINTMENTS' | 'PRESCRIPTIONS' | 'ORDERS'>('ENCOUNTERS');

  const fetchPatientDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch patient
      const pRes = await fetch(`/api/proxy/api/v1/patients/${patientId}`);
      if (!pRes.ok) throw new Error(`Patient not found (Status ${pRes.status})`);
      const pData = (await pRes.json()).data;
      setPatient(pData);

      // 2. Fetch doctor identity
      const meRes = await fetch('/api/proxy/api/v1/doctors/me');
      if (!meRes.ok) throw new Error('Failed to verify doctor identity');
      const doc = (await meRes.json()).data;

      // 3. Fetch doctor's encounters & appointments to filter for this patient
      const [encRes, apptRes, rxRes, ordersRes] = await Promise.all([
        fetch(`/api/proxy/api/v1/encounters/doctor/${doc.id}`),
        fetch(`/api/proxy/api/v1/appointments/doctor/${doc.id}`),
        fetch(`/api/proxy/api/v1/encounters/prescriptions/patient/${patientId}`),
        fetch(`/api/proxy/api/v1/encounters/orders/patient/${patientId}`),
      ]);

      if (encRes.ok) {
        const encData: Encounter[] = (await encRes.json()).data || [];
        setEncounters(encData.filter((e) => String(e.patientId) === String(patientId)));
      }

      if (apptRes.ok) {
        const apptData: Appointment[] = (await apptRes.json()).data || [];
        setAppointments(apptData.filter((a) => String(a.patientId) === String(patientId)));
      }

      if (rxRes.ok) {
        setPrescriptions((await rxRes.json()).data || []);
      }

      if (ordersRes.ok) {
        setOrders((await ordersRes.json()).data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading patient details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-44 rounded-xl border border-border bg-card animate-pulse" />
        <div className="h-72 rounded-xl border border-border bg-card animate-pulse" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/60 p-8 text-center dark:border-red-900/60 dark:bg-red-950/20">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-2" />
        <h2 className="text-base font-bold text-red-900 dark:text-red-200">Unable to load patient</h2>
        <p className="text-xs text-red-700 dark:text-red-400 mt-1">{error}</p>
        <Link
          href="/doctor/patients"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Patients List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href="/doctor/patients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to My Patients</span>
        </Link>
        <button
          onClick={fetchPatientDetails}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Patient Header Banner */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white font-bold text-xl shadow-md shadow-teal-500/20">
              {patient.firstName?.charAt(0)}
              {patient.lastName?.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {patient.firstName} {patient.lastName}
                </h1>
                <span className="font-mono text-xs font-bold rounded-md bg-muted px-2 py-0.5 text-foreground">
                  {patient.mrn}
                </span>
                {patient.bloodGroup && (
                  <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                    Blood: {patient.bloodGroup}
                  </span>
                )}
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  {patient.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                {patient.gender && <span>Gender: <strong className="text-foreground">{patient.gender}</strong></span>}
                {patient.dateOfBirth && <span>DOB: <strong className="text-foreground">{patient.dateOfBirth}</strong></span>}
                {patient.phone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="h-3 w-3" /> {patient.phone}
                  </span>
                )}
                {patient.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {patient.email}
                  </span>
                )}
                {patient.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {patient.address}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('ENCOUNTERS')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'ENCOUNTERS'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Clinical Encounters ({encounters.length})
        </button>
        <button
          onClick={() => setActiveTab('APPOINTMENTS')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'APPOINTMENTS'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('PRESCRIPTIONS')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'PRESCRIPTIONS'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Prescriptions ({prescriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'ORDERS'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Lab & Imaging Orders ({orders.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {activeTab === 'ENCOUNTERS' && (
          encounters.length === 0 ? (
            <div className="p-12 text-center">
              <Stethoscope className="mx-auto h-9 w-9 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No Encounters Recorded</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                There are no documented clinical encounters between you and this patient yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {encounters.map((enc) => (
                <div key={enc.id} className="p-5 space-y-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {enc.encounterNumber}
                      </span>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground uppercase">
                        {enc.encounterType}
                      </span>
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        enc.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                      }`}>
                        {enc.status}
                      </span>
                    </div>
                    <Link
                      href={`/doctor/consultation/${enc.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
                    >
                      <span>{enc.status === 'COMPLETED' ? 'View Record' : 'Resume'}</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Chief Complaint:</span>
                      <p className="font-medium text-foreground">{enc.chiefComplaint || 'None recorded'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Primary Diagnosis:</span>
                      <p className="font-medium text-foreground">{enc.primaryDiagnosis || 'Not finalized'}</p>
                    </div>
                  </div>

                  {enc.clinicalNotes && (
                    <div className="rounded-lg bg-muted/40 p-3 text-xs">
                      <span className="text-muted-foreground block mb-0.5 font-semibold">Clinical Notes:</span>
                      <p className="text-foreground whitespace-pre-wrap">{enc.clinicalNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'APPOINTMENTS' && (
          appointments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="mx-auto h-9 w-9 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No Appointments Found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {appointments.map((a) => (
                <div key={a.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {a.appointmentNumber}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {a.appointmentDate} at {a.startTime}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Type: <span className="uppercase font-medium text-foreground">{a.appointmentType}</span> • Reason: {a.reason || 'General'}
                    </p>
                  </div>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'PRESCRIPTIONS' && (
          prescriptions.length === 0 ? (
            <div className="p-12 text-center">
              <Pill className="mx-auto h-9 w-9 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No Prescriptions Issued</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                No active or historical medications have been prescribed for this patient.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-foreground">
                      {rx.prescriptionNumber}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {rx.createdAt?.split('T')[0]}
                    </span>
                  </div>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/40 font-semibold text-muted-foreground border-b border-border">
                        <tr>
                          <th className="px-3 py-2">Medicine</th>
                          <th className="px-3 py-2">Dosage</th>
                          <th className="px-3 py-2">Frequency</th>
                          <th className="px-3 py-2">Duration</th>
                          <th className="px-3 py-2">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {rx.items?.map((item) => (
                          <tr key={item.id}>
                            <td className="px-3 py-2 font-semibold text-foreground">{item.medicineName}</td>
                            <td className="px-3 py-2">{item.dosage}</td>
                            <td className="px-3 py-2">{item.frequency}</td>
                            <td className="px-3 py-2">{item.duration}</td>
                            <td className="px-3 py-2 text-muted-foreground">{item.instructions || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'ORDERS' && (
          orders.length === 0 ? (
            <div className="p-12 text-center">
              <FlaskConical className="mx-auto h-9 w-9 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No Orders Placed</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                No laboratory or radiology diagnostic orders have been issued for this patient.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {orders.map((ord) => (
                <div key={ord.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {ord.orderNumber}
                      </span>
                      <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                        {ord.orderType}
                      </span>
                      <span className="text-xs font-bold text-foreground">{ord.testName}</span>
                    </div>
                    {ord.clinicalNotes && (
                      <p className="text-xs text-muted-foreground mt-1">Notes: {ord.clinicalNotes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                      {ord.status}
                    </span>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">Priority: {ord.priority}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
