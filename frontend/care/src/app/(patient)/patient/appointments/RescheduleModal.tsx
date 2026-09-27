'use client';

import { useState, useTransition } from 'react';
import { CalendarClock, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RescheduleModalProps {
  appointment: {
    id: number;
    appointmentDate: string;
    startTime?: string;
    endTime?: string;
    status: string;
  };
  onClose: () => void;
}

export function RescheduleModal({ appointment, onClose }: RescheduleModalProps) {
  const [form, setForm] = useState({
    newAppointmentDate: '',
    newStartTime: '',
    newEndTime: '',
    reason: '',
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.newAppointmentDate || !form.newStartTime || !form.newEndTime || !form.reason.trim()) {
      setError('All fields are required.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/proxy/api/v1/appointments/${appointment.id}/reschedule`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            newAppointmentDate: form.newAppointmentDate,
            newStartTime: form.newStartTime + ':00',
            newEndTime: form.newEndTime + ':00',
            reason: form.reason,
          }),
        });

        const data = await res.json();
        if (res.ok && data?.success) {
          setSuccess(true);
          setTimeout(() => {
            router.refresh();
            onClose();
          }, 1800);
        } else {
          setError(data?.message || 'Failed to reschedule appointment.');
        }
      } catch {
        setError('Network error. Please try again.');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-[#007b92]" />
            <h3 className="text-base font-semibold text-foreground">Reschedule Appointment</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-base font-semibold text-foreground">Appointment Rescheduled!</p>
            <p className="text-sm text-muted-foreground mt-1">Refreshing your appointments...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
              Current: {new Date(appointment.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              {appointment.startTime && ` at ${appointment.startTime}`}
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">New Date *</label>
              <input
                type="date"
                min={today}
                required
                value={form.newAppointmentDate}
                onChange={e => setForm(f => ({ ...f, newAppointmentDate: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">New Start Time *</label>
                <input
                  type="time"
                  required
                  value={form.newStartTime}
                  onChange={e => setForm(f => ({ ...f, newStartTime: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">New End Time *</label>
                <input
                  type="time"
                  required
                  value={form.newEndTime}
                  onChange={e => setForm(f => ({ ...f, newEndTime: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Reason for Reschedule *</label>
              <textarea
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Why do you need to reschedule?"
                rows={3}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] resize-none transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
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
                {isPending ? 'Rescheduling...' : 'Reschedule'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
