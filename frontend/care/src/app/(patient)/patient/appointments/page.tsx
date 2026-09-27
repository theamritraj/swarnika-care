import { serverFetch } from '@/lib/server/api-client';
import { getSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, Search, Filter, ChevronRight } from 'lucide-react';
import { AppointmentActions } from './AppointmentActions';

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(timeStr: string) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    CONFIRMED: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-900',
    SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900',
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900',
    COMPLETED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
    NO_SHOW: 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border border-orange-200 dark:border-orange-900',
  };
  return map[status?.toUpperCase()] || 'bg-accent text-muted-foreground';
}

export default async function AppointmentsPage() {
  const session = await getSession();
  if (!session || (!session.roles.includes('PATIENT') && !session.roles.includes('SUPER_ADMIN'))) {
    redirect('/login');
  }

  const profileRes = await serverFetch('/api/v1/patients/me', { next: { revalidate: 0 } });
  const patient = profileRes.ok ? profileRes.data?.data : null;

  let appointments: any[] = [];
  if (patient?.id) {
    const res = await serverFetch(`/api/v1/appointments/patient/${patient.id}`, { next: { revalidate: 0 } });
    if (res.ok && Array.isArray(res.data?.data)) {
      appointments = res.data.data.sort(
        (a: any, b: any) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
      );
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = appointments.filter(a => {
    const d = new Date(a.appointmentDate);
    return d >= today && !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(a.status);
  });
  const past = appointments.filter(a => {
    const d = new Date(a.appointmentDate);
    return d < today || ['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(a.status);
  });

  const AppointmentCard = ({ appt }: { appt: any }) => (
    <div className="p-4 rounded-xl border border-border bg-card hover:border-[#007b92]/20 hover:shadow-sm transition-all">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#007b92]/10 flex flex-col items-center justify-center text-[#007b92] shrink-0">
          <span className="text-lg font-bold leading-none">
            {new Date(appt.appointmentDate).getDate()}
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wide opacity-70">
            {new Date(appt.appointmentDate).toLocaleString('default', { month: 'short' })}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {appt.reason || 'General Consultation'}
              </p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {appt.startTime && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(appt.startTime)}
                    {appt.endTime && ` – ${formatTime(appt.endTime)}`}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  #{appt.appointmentNumber}
                </span>
                {appt.appointmentType && (
                  <span className="text-xs text-muted-foreground capitalize">
                    {appt.appointmentType.toLowerCase().replace('_', ' ')}
                  </span>
                )}
              </div>
              {appt.notes && (
                <p className="text-xs text-muted-foreground mt-1.5 italic line-clamp-1">
                  {appt.notes}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusBadge(appt.status)}`}>
                {appt.status?.replace('_', ' ')}
              </span>
              <AppointmentActions appointment={appt} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#007b92]" />
            My Appointments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {appointments.length} total appointment{appointments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/patient/doctors"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#007b92] text-white text-sm font-semibold rounded-xl hover:bg-[#006274] transition-colors shadow-sm"
        >
          <Search className="w-4 h-4" />
          Book New Appointment
        </Link>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#007b92]" />
          Upcoming ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 py-12 text-center">
            <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">No upcoming appointments</p>
            <Link
              href="/patient/doctors"
              className="mt-4 inline-flex items-center gap-2 text-sm text-[#007b92] font-semibold hover:underline"
            >
              Book with a doctor <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}
          </div>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
            Past & Cancelled ({past.length})
          </h2>
          <div className="space-y-3">
            {past.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}
          </div>
        </div>
      )}
    </div>
  );
}
