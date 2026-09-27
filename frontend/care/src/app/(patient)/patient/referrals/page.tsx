import { serverFetch } from '@/lib/server/api-client';
import { getSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import { ArrowRightLeft, Calendar, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getReferralStatusBadge(status: string) {
  const map: Record<string, string> = {
    REQUESTED: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    ACKNOWLEDGED: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400',
    SCHEDULED: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    REJECTED: 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
  };
  return map[status?.toUpperCase()] || 'bg-accent text-muted-foreground';
}

function getReferralStatusIcon(status: string) {
  switch (status?.toUpperCase()) {
    case 'COMPLETED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'CANCELLED': return <XCircle className="w-4 h-4 text-red-500" />;
    case 'SCHEDULED': return <Clock className="w-4 h-4 text-amber-500" />;
    default: return <ArrowRightLeft className="w-4 h-4 text-[#007b92]" />;
  }
}

// Patient-visible referral status journey
const STATUS_STEPS = ['REQUESTED', 'ACKNOWLEDGED', 'SCHEDULED', 'COMPLETED'];

function StatusProgress({ status }: { status: string }) {
  const upper = status?.toUpperCase();
  const currentIdx = STATUS_STEPS.indexOf(upper);
  if (currentIdx === -1 || upper === 'CANCELLED' || upper === 'REJECTED') return null;

  return (
    <div className="flex items-center gap-1.5 mt-3 overflow-x-auto">
      {STATUS_STEPS.map((step, idx) => (
        <div key={step} className="flex items-center gap-1.5 shrink-0">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
            idx <= currentIdx
              ? 'bg-[#007b92] text-white'
              : 'bg-accent text-muted-foreground'
          }`}>
            {idx <= currentIdx && <CheckCircle2 className="w-2.5 h-2.5" />}
            {step.charAt(0) + step.slice(1).toLowerCase()}
          </div>
          {idx < STATUS_STEPS.length - 1 && (
            <div className={`h-px w-4 shrink-0 ${idx < currentIdx ? 'bg-[#007b92]' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default async function ReferralsPage() {
  const session = await getSession();
  if (!session || (!session.roles.includes('PATIENT') && !session.roles.includes('SUPER_ADMIN'))) {
    redirect('/login');
  }

  const profileRes = await serverFetch('/api/v1/patients/me', { next: { revalidate: 0 } });
  const patient = profileRes.ok ? profileRes.data?.data : null;

  let referrals: any[] = [];
  if (patient?.id) {
    // Secure: /me/referrals resolves patientId from JWT, strips clinicalNotes + administrativeNotes server-side
    const res = await serverFetch('/api/v1/referrals/me', { next: { revalidate: 0 } });
    if (res.ok && Array.isArray(res.data?.data)) {
      referrals = res.data.data.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  }

  return (
    <div className="space-y-6 pb-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-[#007b92]" />
          Referrals
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your specialist and inter-hospital referrals. {referrals.length} referral{referrals.length !== 1 ? 's' : ''} found.
        </p>
      </div>

      {referrals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
          <ArrowRightLeft className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">No referrals found</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Referrals from your doctor will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {referrals.map((ref: any) => (
            <div key={ref.id} className="rounded-xl border border-border bg-card p-5 hover:border-[#007b92]/20 transition-all">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#007b92]/10 flex items-center justify-center shrink-0">
                    {getReferralStatusIcon(ref.status)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {ref.reason || 'Specialist Referral'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      #{ref.referralNumber}
                      {ref.referralType && ` · ${ref.referralType.toLowerCase().replace('_', ' ')}`}
                      {ref.priority && ` · ${ref.priority} priority`}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getReferralStatusBadge(ref.status)}`}>
                  {ref.status?.replace('_', ' ')}
                </span>
              </div>

              {/* Status Journey — patient-friendly progress tracker */}
              <StatusProgress status={ref.status} />

              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {formatDate(ref.createdAt)}
              </div>

              {/* Note: clinicalNotes and administrativeNotes are intentionally NOT shown to patients */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
