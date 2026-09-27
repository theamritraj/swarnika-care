'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Stethoscope,
  Pill,
  FlaskConical,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Plus,
  Trash2,
  Lock,
  Clock,
  User,
  Activity,
  FileCheck,
  Send,
  Printer
} from 'lucide-react';

interface Encounter {
  id: number;
  encounterNumber: string;
  patientId: number;
  hospitalId: number;
  departmentId: number;
  doctorId: number;
  encounterType: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  appointmentId?: number;
  source: string;
  chiefComplaint?: string;
  notes?: string;
  primaryDiagnosis?: string;
  secondaryDiagnosis?: string;
  clinicalNotes?: string;
  treatmentPlan?: string;
  followUpDate?: string;
  followUpNotes?: string;
  startedAt?: string;
  endedAt?: string;
}

interface Patient {
  id: number;
  mrn: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  phone?: string;
}

interface PrescriptionItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
}

interface Prescription {
  id: number;
  prescriptionNumber: string;
  items: Array<PrescriptionItem & { id: number }>;
  notes?: string;
  createdAt: string;
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

export default function DoctorConsultationWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const encounterId = params.encounterId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [orders, setOrders] = useState<ClinicalOrder[]>([]);

  // Form State
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [secondaryDiagnosis, setSecondaryDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');

  // Prescription Builder State
  const [newRxItems, setNewRxItems] = useState<PrescriptionItem[]>([
    { medicineName: '', dosage: '', frequency: 'Once daily (OD)', duration: '5 days', route: 'Oral', instructions: 'After meals' }
  ]);
  const [rxNotes, setRxNotes] = useState('');
  const [savingRx, setSavingRx] = useState(false);

  // Clinical Order Builder State
  const [newOrderType, setNewOrderType] = useState<'LAB' | 'IMAGING'>('LAB');
  const [newOrderTestName, setNewOrderTestName] = useState('');
  const [newOrderPriority, setNewOrderPriority] = useState('ROUTINE');
  const [newOrderNotes, setNewOrderNotes] = useState('');
  const [savingOrder, setSavingOrder] = useState(false);

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState<'NOTES' | 'DIAGNOSIS' | 'PRESCRIPTION' | 'ORDERS' | 'FOLLOWUP'>('NOTES');

  const fetchEncounterData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch encounter
      const encRes = await fetch(`/api/proxy/api/v1/encounters/${encounterId}`);
      if (!encRes.ok) throw new Error(`Failed to load encounter (Status ${encRes.status})`);
      const enc: Encounter = (await encRes.json()).data;
      setEncounter(enc);

      // Populate form state from encounter
      setChiefComplaint(enc.chiefComplaint || '');
      setClinicalNotes(enc.clinicalNotes || '');
      setPrimaryDiagnosis(enc.primaryDiagnosis || '');
      setSecondaryDiagnosis(enc.secondaryDiagnosis || '');
      setTreatmentPlan(enc.treatmentPlan || '');
      setFollowUpDate(enc.followUpDate || '');
      setFollowUpNotes(enc.followUpNotes || '');

      // 2. Fetch patient
      const pRes = await fetch(`/api/proxy/api/v1/patients/${enc.patientId}`);
      if (pRes.ok) {
        setPatient((await pRes.json()).data);
      }

      // 3. Fetch existing prescriptions for this encounter
      const rxRes = await fetch(`/api/proxy/api/v1/encounters/${encounterId}/prescriptions`);
      if (rxRes.ok) {
        setPrescriptions((await rxRes.json()).data || []);
      }

      // 4. Fetch existing orders for this encounter
      const ordersRes = await fetch(`/api/proxy/api/v1/encounters/${encounterId}/orders`);
      if (ordersRes.ok) {
        setOrders((await ordersRes.json()).data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading clinical workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (encounterId) {
      fetchEncounterData();
    }
  }, [encounterId]);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // 1. Save Consultation Notes Draft
  const handleSaveConsultation = async () => {
    if (!encounter || encounter.status === 'COMPLETED') return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/api/v1/encounters/${encounter.id}/consultation`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryDiagnosis,
          secondaryDiagnosis,
          clinicalNotes,
          treatmentPlan,
          followUpDate: followUpDate || null,
          followUpNotes,
        }),
      });

      if (!res.ok) throw new Error('Failed to save consultation details');
      const data = await res.json();
      setEncounter(data.data);
      showNotification('Consultation draft saved successfully.');
    } catch (err: any) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // 2. Add Prescription
  const handleAddRxItem = () => {
    setNewRxItems((prev) => [
      ...prev,
      { medicineName: '', dosage: '', frequency: 'Once daily (OD)', duration: '5 days', route: 'Oral', instructions: 'After meals' },
    ]);
  };

  const handleRemoveRxItem = (index: number) => {
    setNewRxItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateRxItem = (index: number, field: keyof PrescriptionItem, val: string) => {
    setNewRxItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!encounter || encounter.status === 'COMPLETED') return;

    const validItems = newRxItems.filter((i) => i.medicineName.trim() !== '');
    if (validItems.length === 0) {
      alert('Please enter at least one valid medication name.');
      return;
    }

    setSavingRx(true);
    try {
      const res = await fetch(`/api/proxy/api/v1/encounters/${encounter.id}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: rxNotes,
          items: validItems,
        }),
      });

      if (!res.ok) throw new Error('Failed to create prescription');
      const rxData = await res.json();
      setPrescriptions((prev) => [...prev, rxData.data]);
      setNewRxItems([{ medicineName: '', dosage: '', frequency: 'Once daily (OD)', duration: '5 days', route: 'Oral', instructions: 'After meals' }]);
      setRxNotes('');
      showNotification('Prescription issued and saved to patient record.');
    } catch (err: any) {
      alert(`Prescription failed: ${err.message}`);
    } finally {
      setSavingRx(false);
    }
  };

  // 3. Add Clinical Order
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!encounter || encounter.status === 'COMPLETED') return;
    if (!newOrderTestName.trim()) {
      alert('Please provide the test name.');
      return;
    }

    setSavingOrder(true);
    try {
      const res = await fetch(`/api/proxy/api/v1/encounters/${encounter.id}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderType: newOrderType,
          testName: newOrderTestName.trim(),
          priority: newOrderPriority,
          clinicalNotes: newOrderNotes,
        }),
      });

      if (!res.ok) throw new Error('Failed to place clinical order');
      const ordData = await res.json();
      setOrders((prev) => [...prev, ordData.data]);
      setNewOrderTestName('');
      setNewOrderNotes('');
      showNotification(`${newOrderType} order placed successfully.`);
    } catch (err: any) {
      alert(`Order creation failed: ${err.message}`);
    } finally {
      setSavingOrder(false);
    }
  };

  // 4. Complete Consultation
  const handleCompleteConsultation = async () => {
    if (!encounter || encounter.status === 'COMPLETED') return;

    if (!primaryDiagnosis.trim()) {
      alert('A Primary Diagnosis is required before completing this consultation.');
      setActiveTab('DIAGNOSIS');
      return;
    }

    const confirmComplete = confirm(
      'Are you sure you want to finalize this clinical consultation? Once completed, this medical record will be signed and locked.'
    );
    if (!confirmComplete) return;

    setCompleting(true);
    setError(null);
    try {
      // Step A: Save latest notes & diagnosis
      await fetch(`/api/proxy/api/v1/encounters/${encounter.id}/consultation`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryDiagnosis,
          secondaryDiagnosis,
          clinicalNotes,
          treatmentPlan,
          followUpDate: followUpDate || null,
          followUpNotes,
        }),
      });

      // Step B: Finalize & Complete encounter
      const res = await fetch(`/api/proxy/api/v1/encounters/${encounter.id}/complete`, {
        method: 'PATCH',
      });

      if (!res.ok) throw new Error('Failed to complete consultation');
      const data = await res.json();
      setEncounter(data.data);

      // Step C: Also sync associated appointment status to COMPLETED
      if (encounter.appointmentId) {
        await fetch(`/api/proxy/api/v1/appointments/${encounter.appointmentId}/complete`, {
          method: 'PATCH',
        }).catch((err) => console.warn('Appointment status sync skipped:', err));
      }

      showNotification('Consultation finalized, signed and completed.');
    } catch (err: any) {
      setError(err.message || 'Completion failed');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-32 rounded-xl border border-border bg-card animate-pulse" />
        <div className="h-96 rounded-xl border border-border bg-card animate-pulse" />
      </div>
    );
  }

  if (error && !encounter) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/60 p-8 text-center dark:border-red-900/60 dark:bg-red-950/20">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-2" />
        <h2 className="text-base font-bold text-red-900 dark:text-red-200">Encounter not accessible</h2>
        <p className="text-xs text-red-700 dark:text-red-400 mt-1">{error}</p>
        <Link
          href="/doctor/queue"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Queue
        </Link>
      </div>
    );
  }

  const isCompleted = encounter?.status === 'COMPLETED';

  return (
    <div className="space-y-6 pb-20">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/doctor/queue"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Exit Workspace to Queue</span>
        </Link>

        {isCompleted ? (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs">
            <Lock className="h-3.5 w-3.5" />
            <span>Consultation Finalized & Locked</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
            <Activity className="h-3.5 w-3.5 animate-pulse text-blue-600" />
            <span>Active Clinical Session</span>
          </div>
        )}
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-teal-600 text-white p-3 text-xs font-medium shadow-md">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Patient Banner */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white font-bold text-lg shadow-sm">
              {patient?.firstName?.charAt(0)}
              {patient?.lastName?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  {patient?.firstName} {patient?.lastName}
                </h1>
                <span className="font-mono text-xs font-bold rounded-md bg-muted px-2 py-0.5 text-foreground">
                  {patient?.mrn || 'MRN-PENDING'}
                </span>
                {patient?.bloodGroup && (
                  <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                    {patient.bloodGroup}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5">
                <span>Gender: <strong className="text-foreground">{patient?.gender || 'N/A'}</strong></span>
                <span>DOB: <strong className="text-foreground">{patient?.dateOfBirth || 'N/A'}</strong></span>
                <span>Encounter: <strong className="font-mono text-foreground">{encounter?.encounterNumber}</strong></span>
                <span>Type: <strong className="uppercase text-foreground">{encounter?.encounterType}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/doctor/patients/${patient?.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
            >
              <User className="h-3.5 w-3.5" />
              <span>Patient Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('NOTES')}
          className={`flex items-center gap-1.5 pb-3 text-xs font-bold transition-all shrink-0 ${
            activeTab === 'NOTES'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileCheck className="h-4 w-4" />
          <span>1. Clinical Evaluation</span>
        </button>

        <button
          onClick={() => setActiveTab('DIAGNOSIS')}
          className={`flex items-center gap-1.5 pb-3 text-xs font-bold transition-all shrink-0 ${
            activeTab === 'DIAGNOSIS'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Stethoscope className="h-4 w-4" />
          <span>2. Diagnosis</span>
          {primaryDiagnosis && <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />}
        </button>

        <button
          onClick={() => setActiveTab('PRESCRIPTION')}
          className={`flex items-center gap-1.5 pb-3 text-xs font-bold transition-all shrink-0 ${
            activeTab === 'PRESCRIPTION'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Pill className="h-4 w-4" />
          <span>3. Prescriptions ({prescriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`flex items-center gap-1.5 pb-3 text-xs font-bold transition-all shrink-0 ${
            activeTab === 'ORDERS'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FlaskConical className="h-4 w-4" />
          <span>4. Lab & Imaging Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('FOLLOWUP')}
          className={`flex items-center gap-1.5 pb-3 text-xs font-bold transition-all shrink-0 ${
            activeTab === 'FOLLOWUP'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>5. Follow-up</span>
        </button>
      </div>

      {/* Main Tab Panels */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        {/* TAB 1: CLINICAL EVALUATION */}
        {activeTab === 'NOTES' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Chief Complaint
              </label>
              <input
                type="text"
                disabled={isCompleted}
                placeholder="e.g. Chest discomfort, fever for 3 days, palpitations on exertion"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 disabled:opacity-70"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Clinical Examination & Progress Notes
              </label>
              <textarea
                rows={6}
                disabled={isCompleted}
                placeholder="Document physical examination findings, vitals summary, heart/lung auscultation, systemic examination..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="w-full rounded-lg border border-border bg-background p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 disabled:opacity-70 leading-relaxed font-sans"
              />
            </div>
          </div>
        )}

        {/* TAB 2: DIAGNOSIS */}
        {activeTab === 'DIAGNOSIS' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Primary Diagnosis <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled={isCompleted}
                placeholder="e.g. Essential Hypertension / Sinus Tachycardia / Acute Bronchitis"
                value={primaryDiagnosis}
                onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-xs text-foreground font-semibold placeholder:font-normal placeholder:text-muted-foreground focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 disabled:opacity-70"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Authoritative clinical finding required for final sign-off.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Secondary / Differential Diagnosis
              </label>
              <input
                type="text"
                disabled={isCompleted}
                placeholder="e.g. Dyslipidemia, Type 2 Diabetes Mellitus"
                value={secondaryDiagnosis}
                onChange={(e) => setSecondaryDiagnosis(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 disabled:opacity-70"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Treatment Plan & Clinical Impression
              </label>
              <textarea
                rows={4}
                disabled={isCompleted}
                placeholder="Lifestyle recommendations, clinical goals, dietary precautions, activity restrictions..."
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                className="w-full rounded-lg border border-border bg-background p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 disabled:opacity-70 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TAB 3: PRESCRIPTIONS */}
        {activeTab === 'PRESCRIPTION' && (
          <div className="space-y-6">
            {/* Existing Prescriptions in Encounter */}
            {prescriptions.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Saved Prescriptions in this Encounter
                </h3>
                <div className="space-y-3">
                  {prescriptions.map((rx) => (
                    <div key={rx.id} className="rounded-lg border border-border bg-muted/20 p-4">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {rx.prescriptionNumber}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Issued {rx.createdAt?.split('T')[0]}
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="text-[11px] font-semibold text-muted-foreground">
                            <tr>
                              <th className="py-1">Medicine</th>
                              <th className="py-1">Dosage</th>
                              <th className="py-1">Frequency</th>
                              <th className="py-1">Duration</th>
                              <th className="py-1">Route</th>
                              <th className="py-1">Instructions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {rx.items?.map((item) => (
                              <tr key={item.id}>
                                <td className="py-2 font-bold text-foreground">{item.medicineName}</td>
                                <td className="py-2">{item.dosage}</td>
                                <td className="py-2">{item.frequency}</td>
                                <td className="py-2">{item.duration}</td>
                                <td className="py-2">{item.route || 'Oral'}</td>
                                <td className="py-2 text-muted-foreground">{item.instructions || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prescription Item Builder */}
            {!isCompleted && (
              <form onSubmit={handleSavePrescription} className="rounded-xl border border-teal-200 bg-teal-50/20 p-5 dark:border-teal-900/60 dark:bg-teal-950/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-300">
                    Create New Prescription
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddRxItem}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 dark:text-teal-400"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {newRxItems.map((item, idx) => (
                    <div key={idx} className="rounded-lg border border-border bg-card p-3 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase">
                          Item #{idx + 1}
                        </span>
                        {newRxItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRxItem(idx)}
                            className="text-red-500 hover:text-red-600 text-xs"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
                        <div className="lg:col-span-2">
                          <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">Medicine Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Paracetamol 500mg"
                            value={item.medicineName}
                            onChange={(e) => handleUpdateRxItem(idx, 'medicineName', e.target.value)}
                            className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">Dosage</label>
                          <input
                            type="text"
                            placeholder="e.g. 500mg, 1 tab"
                            value={item.dosage}
                            onChange={(e) => handleUpdateRxItem(idx, 'dosage', e.target.value)}
                            className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">Frequency</label>
                          <select
                            value={item.frequency}
                            onChange={(e) => handleUpdateRxItem(idx, 'frequency', e.target.value)}
                            className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs text-foreground"
                          >
                            <option>Once daily (OD)</option>
                            <option>Twice daily (BD)</option>
                            <option>Thrice daily (TDS)</option>
                            <option>Four times daily (QID)</option>
                            <option>As needed (SOS)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">Duration</label>
                          <input
                            type="text"
                            placeholder="e.g. 5 days, 1 month"
                            value={item.duration}
                            onChange={(e) => handleUpdateRxItem(idx, 'duration', e.target.value)}
                            className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">Route</label>
                          <select
                            value={item.route}
                            onChange={(e) => handleUpdateRxItem(idx, 'route', e.target.value)}
                            className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs text-foreground"
                          >
                            <option>Oral</option>
                            <option>Topical</option>
                            <option>IV</option>
                            <option>IM</option>
                            <option>Inhalation</option>
                            <option>Sublingual</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">Special Instructions</label>
                        <input
                          type="text"
                          placeholder="e.g. Take after breakfast with water"
                          value={item.instructions}
                          onChange={(e) => handleUpdateRxItem(idx, 'instructions', e.target.value)}
                          className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <input
                    type="text"
                    placeholder="General prescription notes (optional)..."
                    value={rxNotes}
                    onChange={(e) => setRxNotes(e.target.value)}
                    className="w-full max-w-md rounded border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground mr-3"
                  />
                  <button
                    type="submit"
                    disabled={savingRx}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-2xs disabled:opacity-60 shrink-0"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{savingRx ? 'Saving Rx...' : 'Issue Prescription'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 4: LAB & IMAGING ORDERS */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-6">
            {/* Existing Orders */}
            {orders.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Active Clinical Orders
                </h3>
                <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                  {orders.map((ord) => (
                    <div key={ord.id} className="p-4 flex items-center justify-between hover:bg-muted/20">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {ord.orderNumber}
                          </span>
                          <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                            {ord.orderType}
                          </span>
                          <span className="text-xs font-bold text-foreground">{ord.testName}</span>
                        </div>
                        {ord.clinicalNotes && (
                          <p className="text-xs text-muted-foreground mt-0.5">Indication: {ord.clinicalNotes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                          {ord.status}
                        </span>
                        <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">Priority: {ord.priority}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Create Order Form */}
            {!isCompleted && (
              <form onSubmit={handleCreateOrder} className="rounded-xl border border-border bg-muted/20 p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Place Diagnostic Order
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Order Category</label>
                    <select
                      value={newOrderType}
                      onChange={(e) => setNewOrderType(e.target.value as any)}
                      className="w-full rounded border border-border bg-background px-3 py-2 text-xs text-foreground"
                    >
                      <option value="LAB">Laboratory Diagnostic (LAB)</option>
                      <option value="IMAGING">Radiology & Imaging (IMAGING)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Priority</label>
                    <select
                      value={newOrderPriority}
                      onChange={(e) => setNewOrderPriority(e.target.value)}
                      className="w-full rounded border border-border bg-background px-3 py-2 text-xs text-foreground"
                    >
                      <option value="ROUTINE">ROUTINE</option>
                      <option value="URGENT">URGENT</option>
                      <option value="STAT">STAT / EMERGENCY</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Test Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 12-Lead ECG, Complete Blood Count, Chest X-Ray"
                      value={newOrderTestName}
                      onChange={(e) => setNewOrderTestName(e.target.value)}
                      className="w-full rounded border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Clinical Indication / Reason</label>
                  <input
                    type="text"
                    placeholder="Brief clinical reason or indication for diagnostic department..."
                    value={newOrderNotes}
                    onChange={(e) => setNewOrderNotes(e.target.value)}
                    className="w-full rounded border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="text-right">
                  <button
                    type="submit"
                    disabled={savingOrder}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-2xs disabled:opacity-60"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{savingOrder ? 'Submitting Order...' : 'Submit Order'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 5: FOLLOW-UP */}
        {activeTab === 'FOLLOWUP' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Recommended Follow-up Date
              </label>
              <input
                type="date"
                disabled={isCompleted}
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full max-w-xs rounded-lg border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 disabled:opacity-70"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Follow-up Instructions / Warnings
              </label>
              <textarea
                rows={4}
                disabled={isCompleted}
                placeholder="Instructions for review of tests, warning signs to visit emergency, monitoring schedule..."
                value={followUpNotes}
                onChange={(e) => setFollowUpNotes(e.target.value)}
                className="w-full rounded-lg border border-border bg-background p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 disabled:opacity-70 leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      {!isCompleted && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/90 backdrop-blur-md px-6 py-3.5 shadow-lg">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Autosave draft ready</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveConsultation}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs disabled:opacity-60"
              >
                <Save className="h-4 w-4 text-muted-foreground" />
                <span>{saving ? 'Saving...' : 'Save Draft'}</span>
              </button>

              <button
                type="button"
                onClick={handleCompleteConsultation}
                disabled={completing}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-sm shadow-teal-600/20 disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{completing ? 'Completing...' : 'Complete Consultation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
