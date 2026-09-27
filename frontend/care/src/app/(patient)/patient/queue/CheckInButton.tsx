'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CheckInButtonProps {
  appointmentId: number;
  hospitalId?: number;
  departmentId?: number;
  doctorId?: number;
}

export function CheckInButton({ appointmentId, hospitalId, departmentId, doctorId }: CheckInButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<any>(null);
  const router = useRouter();

  const handleCheckIn = async () => {
    setError('');
    startTransition(async () => {
      try {
        // Step 1: Create OPD encounter (check-in → opens encounter)
        const encRes = await fetch('/api/proxy/api/v1/opd/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId,
            hospitalId,
            departmentId,
            doctorId,
          }),
        });

        if (!encRes.ok) {
          // If OPD check-in endpoint not available, try queue token directly
          const tokenRes = await fetch('/api/proxy/api/v1/queue-tokens/issue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appointmentId,
              hospitalId,
              departmentId,
              doctorId,
              priority: 'NORMAL',
            }),
          });
          if (tokenRes.ok) {
            const td = await tokenRes.json();
            setToken(td?.data);
            setDone(true);
            router.refresh();
            return;
          }
          const ed = await encRes.json();
          setError(ed?.message || 'Check-in failed. Please visit the front desk.');
          return;
        }

        const encData = await encRes.json();
        setDone(true);
        setToken(encData?.data?.queueToken || encData?.data);
        router.refresh();
      } catch {
        setError('Network error. Please visit the front desk for check-in.');
      }
    });
  };

  if (done) {
    return (
      <div className="mt-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold text-sm mb-1">
          <CheckCircle2 className="w-4 h-4" />
          Checked In
        </div>
        {token?.tokenNumber && (
          <p className="text-xs text-green-600 dark:text-green-500">
            Queue Token: <span className="font-bold text-base">{token.tokenNumber}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mb-2">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleCheckIn}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
        {isPending ? 'Checking in...' : 'Check In'}
      </button>
    </div>
  );
}
