import { serverFetch } from '@/lib/server/api-client';
import { getSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import { Bed, Calendar, Clock, MapPin } from 'lucide-react';

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getAdmissionStatusBadge(status: string) {
  const map: Record<string, string> = {
    INITIATED: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    PENDING_BED: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    ADMITTED: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
    DISCHARGED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    TRANSFERRED: 'bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400',
  };
  return map[status?.toUpperCase()] || 'bg-accent text-muted-foreground';
}

export default async function AdmissionsPage() {
  const session = await getSession();
  if (!session || (!session.roles.includes('PATIENT') && !session.roles.includes('SUPER_ADMIN'))) {
    redirect('/login');
  }

  const profileRes = await serverFetch('/api/v1/patients/me', { next: { revalidate: 0 } });
  const patient = profileRes.ok ? profileRes.data?.data : null;

  let admissions: any[] = [];
  if (patient?.id) {
    // Secure: /me/admissions resolves patientId from JWT server-side
    const res = await serverFetch('/api/v1/admissions/me', { next: { revalidate: 0 } });
    if (res.ok && Array.isArray(res.data?.data)) {
      admissions = res.data.data.sort(
        (a: any, b: any) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime()
      );
    }
  }

  const active = admissions.filter(a => !['DISCHARGED', 'CANCELLED'].includes(a.status));
  const past = admissions.filter(a => ['DISCHARGED', 'CANCELLED'].includes(a.status));

  const AdmissionCard = ({ admission }: { admission: any }) => (
    <div className="rounded-xl border border-border bg-card p-5 hover:border-[#007b92]/20 transition-all">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#007b92]/10 flex items-center justify-center shrink-0">
            <Bed className="w-5 h-5 text-[#007b92]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {admission.reason || 'Inpatient Admission'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Admission #{admission.admissionNumber}
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getAdmissionStatusBadge(admission.status)}`}>
          {admission.status?.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>Admitted: <span className="text-foreground font-medium">{formatDate(admission.admissionDate)}</span></span>
        </div>
        {admission.admissionType && (
          <div className="flex items-center gap-1.5 text-muted-foreground capitalize">
            <span>Type: <span className="text-foreground font-medium">{admission.admissionType.toLowerCase().replace('_', ' ')}</span></span>
          </div>
        )}
        {admission.wardId && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>Ward: <span className="text-foreground font-medium">#{admission.wardId}</span></span>
          </div>
        )}
        {admission.bedId && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span>Bed: <span className="text-foreground font-medium">#{admission.bedId}</span></span>
          </div>
        )}
      </div>

      {admission.notes && (
        <p className="text-xs text-muted-foreground mt-3 italic border-t border-border/50 pt-3">
          {admission.notes}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Bed className="w-5 h-5 text-[#007b92]" />
          Admissions / IPD
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your inpatient admission history. {admissions.length} admission{admissions.length !== 1 ? 's' : ''} found.
        </p>
      </div>

      {admissions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
          <Bed className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">No admissions found</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Your inpatient admissions will appear here.</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Active ({active.length})
              </h2>
              <div className="space-y-4">
                {active.map(a => <AdmissionCard key={a.id} admission={a} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                Past ({past.length})
              </h2>
              <div className="space-y-4">
                {past.map(a => <AdmissionCard key={a.id} admission={a} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
