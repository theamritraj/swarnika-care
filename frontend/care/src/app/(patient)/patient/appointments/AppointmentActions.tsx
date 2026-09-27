'use client';

import { useState, useTransition } from 'react';
import { X, AlertTriangle, CalendarClock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RescheduleModal } from './RescheduleModal';

interface AppointmentActionsProps {
  appointment: {
    id: number;
    status: string;
    appointmentDate: string;
    startTime?: string;
    endTime?: string;
  };
}

export function AppointmentActions({ appointment }: AppointmentActionsProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const router = useRouter();

  const canAct = ['SCHEDULED', 'CONFIRMED', 'PENDING'].includes(appointment.status?.toUpperCase());
  if (!canAct) return null;

  const handleCancel = async () => {
    if (!cancelReason.trim()) { setError('Please provide a reason.'); return; }
    setError('');
    startTransition(async () => {
      try {
        const res = await fetch(`/api/proxy/api/v1/appointments/${appointment.id}/cancel`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: cancelReason }),
        });
        if (res.ok) {
          setShowCancelModal(false);
          router.refresh();
        } else {
          const d = await res.json();
          setError(d?.message || 'Failed to cancel appointment.');
        }
      } catch {
        setError('Network error.');
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setShowRescheduleModal(true)}
          className="text-xs text-[#007b92] hover:text-[#006274] font-medium px-2.5 py-1 rounded-lg hover:bg-[#007b92]/10 transition-colors"
          title="Reschedule"
        >
          <CalendarClock className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 font-medium px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-semibold text-foreground">Cancel Appointment</h3>
              </div>
              <button
                onClick={() => { setShowCancelModal(false); setError(''); setCancelReason(''); }}
                className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for cancelling your appointment on{' '}
              <span className="font-medium text-foreground">
                {new Date(appointment.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>.
            </p>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] resize-none mb-3"
            />
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setShowCancelModal(false); setError(''); setCancelReason(''); }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg transition-colors"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Cancelling...' : 'Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <RescheduleModal
          appointment={appointment}
          onClose={() => setShowRescheduleModal(false)}
        />
      )}
    </>
  );
}
