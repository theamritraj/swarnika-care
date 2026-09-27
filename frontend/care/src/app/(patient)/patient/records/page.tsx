import { serverFetch } from '@/lib/server/api-client';
import { getSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import { Stethoscope, Calendar, Clock, Activity } from 'lucide-react';

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getEncounterStatusBadge(status: string) {
  const map: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  };
  return map[status?.toUpperCase()] || 'bg-accent text-muted-foreground';
}

export default async function MedicalRecordsPage() {
  const session = await getSession();
  if (!session || (!session.roles.includes('PATIENT') && !session.roles.includes('SUPER_ADMIN'))) {
    redirect('/login');
  }

  // Use /me/encounters — identity resolved from JWT server-side, NEVER from URL param
  let encounters: any[] = [];
  const res = await serverFetch('/api/v1/encounters/me/encounters', { next: { revalidate: 0 } });
  if (res.ok && Array.isArray(res.data?.data)) {
    encounters = res.data.data.sort(
      (a: any, b: any) => new Date(b.createdAt || b.startedAt).getTime() - new Date(a.createdAt || a.startedAt).getTime()
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-[#007b92]" />
          Medical Records
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your complete encounter and visit history. {encounters.length} record{encounters.length !== 1 ? 's' : ''} found.
        </p>
      </div>

      {encounters.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
          <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">No medical records found</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Your encounter history will appear here after visits.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {encounters.map((enc: any) => (
            <div key={enc.id} className="rounded-xl border border-border bg-card p-5 hover:border-[#007b92]/20 transition-all">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#007b92]/10 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5 text-[#007b92]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {enc.chiefComplaint || 'Consultation'}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(enc.startedAt || enc.createdAt)}
                      </span>
                      {enc.encounterNumber && (
                        <span className="text-xs text-muted-foreground">#{enc.encounterNumber}</span>
                      )}
                      {enc.encounterType && (
                        <span className="text-xs text-muted-foreground capitalize">
                          {enc.encounterType.toLowerCase().replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getEncounterStatusBadge(enc.status)}`}>
                  {enc.status?.replace('_', ' ')}
                </span>
              </div>

              {/* Patient-visible clinical details only */}
              {(enc.primaryDiagnosis || enc.followUpDate) && (
                <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {enc.primaryDiagnosis && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Diagnosis</p>
                      <p className="text-sm text-foreground">{enc.primaryDiagnosis}</p>
                    </div>
                  )}
                  {enc.followUpDate && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Follow-up Date</p>
                      <p className="text-sm text-foreground">{formatDate(enc.followUpDate)}</p>
                    </div>
                  )}
                  {enc.followUpNotes && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Follow-up Notes</p>
                      <p className="text-sm text-foreground">{enc.followUpNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {enc.status === 'COMPLETED' && enc.endedAt && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Completed: {formatDateTime(enc.endedAt)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
