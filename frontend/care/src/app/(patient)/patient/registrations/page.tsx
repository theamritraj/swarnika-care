import { serverFetch } from '@/lib/server/api-client';
import { getSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import { Building2, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-900',
    INACTIVE: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    SUSPENDED: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  };
  return map[status?.toUpperCase()] || 'bg-accent text-muted-foreground';
}

export default async function HospitalRegistrationsPage() {
  const session = await getSession();
  if (!session || (!session.roles.includes('PATIENT') && !session.roles.includes('SUPER_ADMIN'))) {
    redirect('/login');
  }

  const profileRes = await serverFetch('/api/v1/patients/me', { next: { revalidate: 0 } });
  const patient = profileRes.ok ? profileRes.data?.data : null;

  let registrations: any[] = [];
  if (patient?.id) {
    const res = await serverFetch(`/api/v1/patients/${patient.id}/registrations`, { next: { revalidate: 0 } });
    if (res.ok && Array.isArray(res.data?.data)) {
      registrations = res.data.data;
    }
  }

  // Fetch hospital names for context
  const hospitalsRes = await serverFetch('/api/v1/public/hospitals', { next: { revalidate: 300 } });
  const hospitals: any[] = hospitalsRes.ok && Array.isArray(hospitalsRes.data?.data) ? hospitalsRes.data.data : [];
  const hospitalMap: Record<number, string> = {};
  hospitals.forEach((h: any) => { if (h.id) hospitalMap[h.id] = h.name; });

  return (
    <div className="space-y-6 pb-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#007b92]" />
          Hospital Registrations
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your hospital registrations and affiliations. {registrations.length} registration{registrations.length !== 1 ? 's' : ''} found.
        </p>
      </div>

      {registrations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">No hospital registrations found</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Your hospital registrations will appear here after your first visit or registration.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg: any) => (
            <div key={reg.id} className="rounded-xl border border-border bg-card p-5 hover:border-[#007b92]/20 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#007b92]/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-[#007b92]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {hospitalMap[reg.hospitalId] || `Hospital #${reg.hospitalId}`}
                    </h3>
                    {reg.registrationNumber && (
                      <p className="text-xs text-muted-foreground mt-0.5">Reg. #{reg.registrationNumber}</p>
                    )}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusBadge(reg.status)}`}>
                  {reg.status}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Registered: {formatDate(reg.registrationDate)}
                </div>
                {reg.createdAt && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Added: {formatDate(reg.createdAt)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info note */}
      <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-4">
        <p className="text-xs text-blue-700 dark:text-blue-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          To register at a new hospital or update your registration status, please contact the hospital reception or front desk.
        </p>
      </div>
    </div>
  );
}
