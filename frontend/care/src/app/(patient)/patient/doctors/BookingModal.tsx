'use client';

import { useState, useTransition } from 'react';
import { X, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BookingModalProps {
  doctor: {
    doctorId: number;
    firstName: string;
    lastName: string;
    specialization: string;
    hospitalId?: number;
    departmentId?: number;
  };
  patientId: number;
  onClose: () => void;
}

export function BookingModal({ doctor, patientId, onClose }: BookingModalProps) {
  const [form, setForm] = useState({
    appointmentDate: '',
    startTime: '',
    reason: '',
    appointmentType: 'CONSULTATION',
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.appointmentDate || !form.startTime) {
      setError('Please select date and time.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/proxy/api/v1/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId,
            doctorId: doctor.doctorId,
            hospitalId: doctor.hospitalId,
            departmentId: doctor.departmentId,
            appointmentDate: form.appointmentDate,
            startTime: form.startTime + ':00',
            reason: form.reason || 'General Consultation',
            appointmentType: form.appointmentType,
            bookingSource: 'PATIENT_PORTAL',
          }),
        });

        const data = await res.json();
        if (res.ok && data?.success) {
          setSuccess(true);
          setTimeout(() => {
            router.push('/patient/appointments');
            router.refresh();
          }, 1800);
        } else {
          setError(data?.message || 'Failed to book appointment.');
        }
      } catch {
        setError('Network error. Please try again.');
      }
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-foreground">Book Appointment</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{doctorName} · {doctor.specialization}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-base font-semibold text-foreground">Appointment Booked!</p>
            <p className="text-sm text-muted-foreground mt-1">Redirecting to your appointments...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                <Calendar className="inline w-3 h-3 mr-1" />Appointment Date *
              </label>
              <input
                type="date"
                min={today}
                required
                value={form.appointmentDate}
                onChange={e => setForm(f => ({ ...f, appointmentDate: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                <Clock className="inline w-3 h-3 mr-1" />Preferred Time *
              </label>
              <input
                type="time"
                required
                value={form.startTime}
                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Appointment Type</label>
              <select
                value={form.appointmentType}
                onChange={e => setForm(f => ({ ...f, appointmentType: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] transition-all"
              >
                <option value="CONSULTATION">Consultation</option>
                <option value="FOLLOW_UP">Follow-up</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="ROUTINE_CHECKUP">Routine Check-up</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Reason / Chief Complaint</label>
              <textarea
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Briefly describe your reason for visit..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] resize-none transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#007b92] text-white rounded-xl hover:bg-[#006274] transition-colors disabled:opacity-50"
              >
                {isPending ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
