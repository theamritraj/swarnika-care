'use client';

import { useState, useTransition } from 'react';
import { User, Mail, Phone, MapPin, Droplets, AlertTriangle, Save, Edit2, Shield } from 'lucide-react';

interface PatientProfileFormProps {
  patient: {
    id: number;
    mrn: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    bloodGroup?: string;
    address?: string;
    emergencyContact?: string;
    status?: string;
  };
}

export function PatientProfileForm({ patient }: PatientProfileFormProps) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    phone: patient.phone || '',
    address: patient.address || '',
    emergencyContact: patient.emergencyContact || '',
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    startTransition(async () => {
      try {
        // Use PATCH /me — server derives patient identity from JWT, never from URL
        const res = await fetch('/api/proxy/api/v1/patients/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: form.phone,
            address: form.address,
            emergencyContact: form.emergencyContact,
          }),
        });

        if (res.ok) {
          setSuccessMsg('Profile updated successfully.');
          setEditing(false);
        } else {
          const d = await res.json();
          setErrorMsg(d?.message || 'Failed to update profile.');
        }
      } catch {
        setErrorMsg('Network error. Please try again.');
      }
    });
  };

  const readOnlyFields = [
    { label: 'Medical Record Number', value: patient.mrn, icon: Shield, note: 'System-assigned, read-only' },
    { label: 'Full Name', value: `${patient.firstName} ${patient.lastName}`, icon: User, note: 'Contact admin to update' },
    { label: 'Email Address', value: patient.email, icon: Mail, note: 'Contact admin to update' },
    { label: 'Date of Birth', value: patient.dateOfBirth || '—', icon: null, note: 'Contact admin to update' },
    { label: 'Gender', value: patient.gender || '—', icon: null, note: 'Contact admin to update' },
    { label: 'Blood Group', value: patient.bloodGroup || '—', icon: Droplets, note: 'Contact admin to update' },
    { label: 'Account Status', value: patient.status || '—', icon: null, note: null },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successMsg && (
        <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Read-Only Clinical/System Fields */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">System & Clinical Fields</h3>
          <span className="ml-auto text-[10px] text-muted-foreground bg-accent px-2 py-0.5 rounded-full font-medium">
            READ-ONLY
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {readOnlyFields.map(field => (
            <div key={field.label}>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">{field.label}</label>
              <div className="px-3 py-2.5 rounded-lg bg-accent/50 border border-border/50 text-sm text-foreground font-medium flex items-center gap-2">
                {field.value}
              </div>
              {field.note && (
                <p className="text-[10px] text-muted-foreground/70 mt-1">{field.note}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Editable Administrative Fields */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#007b92]" />
            <h3 className="text-sm font-semibold text-foreground">Contact Information</h3>
          </div>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs text-[#007b92] hover:text-[#006274] font-semibold transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setEditing(false); setErrorMsg(''); setSuccessMsg(''); }}
              className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              <Phone className="inline w-3 h-3 mr-1" />Phone Number
            </label>
            {editing ? (
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#007b92] transition-all"
              />
            ) : (
              <div className="px-3 py-2.5 rounded-lg bg-accent/30 border border-border/50 text-sm text-foreground">
                {form.phone || <span className="text-muted-foreground">—</span>}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              <AlertTriangle className="inline w-3 h-3 mr-1" />Emergency Contact
            </label>
            {editing ? (
              <input
                type="text"
                value={form.emergencyContact}
                onChange={e => setForm(f => ({ ...f, emergencyContact: e.target.value }))}
                placeholder="Name & phone number"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#007b92] transition-all"
              />
            ) : (
              <div className="px-3 py-2.5 rounded-lg bg-accent/30 border border-border/50 text-sm text-foreground">
                {form.emergencyContact || <span className="text-muted-foreground">—</span>}
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              <MapPin className="inline w-3 h-3 mr-1" />Address
            </label>
            {editing ? (
              <textarea
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Street, City, State, PIN"
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#007b92] transition-all resize-none"
              />
            ) : (
              <div className="px-3 py-2.5 rounded-lg bg-accent/30 border border-border/50 text-sm text-foreground min-h-[70px]">
                {form.address || <span className="text-muted-foreground">—</span>}
              </div>
            )}
          </div>
        </div>

        {editing && (
          <div className="flex justify-end mt-5">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#007b92] text-white text-sm font-semibold rounded-lg hover:bg-[#006274] transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
