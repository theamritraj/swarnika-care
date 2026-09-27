import { serverFetch } from '@/lib/server/api-client';
import { getSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import { Hash, Clock, CheckCircle2, Hourglass, AlertCircle } from 'lucide-react';
import { CheckInButton } from './CheckInButton';

function getTokenStatusBadge(status: string) {
  const map: Record<string, string> = {
    WAITING: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    CALLED: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    IN_CONSULTATION: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
    COMPLETED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    SKIPPED: 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
  };
  return map[status?.toUpperCase()] || 'bg-accent text-muted-foreground';
}

function formatTime(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function QueuePage() {
  const session = await getSession();
  if (!session || (!session.roles.includes('PATIENT') && !session.roles.includes('SUPER_ADMIN'))) {
    redirect('/login');
  }

  const profileRes = await serverFetch('/api/v1/patients/me', { next: { revalidate: 0 } });
  const patient = profileRes.ok ? profileRes.data?.data : null;

  // Fetch today's appointments for check-in eligibility
  let todayAppointments: any[] = [];
  if (patient?.id) {
    const today = new Date().toISOString().split('T')[0];
    const res = await serverFetch(`/api/v1/appointments/patient/${patient.id}`, { next: { revalidate: 0 } });
    if (res.ok && Array.isArray(res.data?.data)) {
      todayAppointments = res.data.data.filter((a: any) =>
        a.appointmentDate === today &&
        ['SCHEDULED', 'CONFIRMED'].includes(a.status?.toUpperCase())
      );
    }
  }

  // Secure: use /me endpoint — ownership enforced by JWT server-side, never trust patientId from client
  let queueTokens: any[] = [];
  const today = new Date().toISOString().split('T')[0];

  for (const appt of todayAppointments) {
    if (appt.hospitalId) {
      const res = await serverFetch(
        `/api/v1/queue-tokens/me?hospitalId=${appt.hospitalId}&queueDate=${today}`,
        { next: { revalidate: 0 } }
      );
      if (res.ok && Array.isArray(res.data?.data)) {
        queueTokens.push(...res.data.data);
      }
    }
  }

  return (
    <div className="space-y-6 pb-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Hash className="w-5 h-5 text-[#007b92]" />
          Check-in & Queue
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Check in for today's appointments and track your queue position.
        </p>
      </div>

      {/* Today's Appointments — Check-in */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Today's Appointments</h2>
        {todayAppointments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 py-10 text-center">
            <AlertCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">No appointments today</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Check-in is available for today's scheduled appointments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayAppointments.map((appt: any) => (
              <div key={appt.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{appt.reason || 'Consultation'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      #{appt.appointmentNumber}
                      {appt.startTime && ` · ${appt.startTime}`}
                      {appt.appointmentType && ` · ${appt.appointmentType.toLowerCase().replace('_', ' ')}`}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                    {appt.status}
                  </span>
                </div>
                <CheckInButton
                  appointmentId={appt.id}
                  hospitalId={appt.hospitalId}
                  departmentId={appt.departmentId}
                  doctorId={appt.doctorId}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Queue Tokens */}
      {queueTokens.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Your Queue Status</h2>
          <div className="space-y-4">
            {queueTokens.map((token: any) => (
              <div key={token.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Token</p>
                    <p className="text-4xl font-black text-[#007b92]">{token.tokenNumber}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase ${getTokenStatusBadge(token.status)}`}>
                    {token.status?.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {token.sequenceNumber && (
                    <div>
                      <p className="text-muted-foreground">Queue Number</p>
                      <p className="text-foreground font-semibold text-base">#{token.sequenceNumber}</p>
                    </div>
                  )}
                  {token.priority && (
                    <div>
                      <p className="text-muted-foreground">Priority</p>
                      <p className="text-foreground font-semibold capitalize">{token.priority.toLowerCase()}</p>
                    </div>
                  )}
                  {token.queueDate && (
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="text-foreground font-semibold">{formatDate(token.queueDate)}</p>
                    </div>
                  )}
                  {token.calledAt && (
                    <div>
                      <p className="text-muted-foreground">Called At</p>
                      <p className="text-foreground font-semibold">{formatTime(token.calledAt)}</p>
                    </div>
                  )}
                </div>

                {token.status === 'WAITING' && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2">
                    <Hourglass className="w-3.5 h-3.5 animate-pulse" />
                    Waiting to be called. Please stay in the waiting area.
                  </div>
                )}
                {token.status === 'CALLED' && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 rounded-lg px-3 py-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    You have been called! Please proceed to the doctor's cabin.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy note */}
      <div className="rounded-lg border border-border bg-card/50 p-4">
        <p className="text-xs text-muted-foreground">
          Queue information shown is private to your account only. Position and wait times are indicative based on real-time doctor availability.
        </p>
      </div>
    </div>
  );
}
