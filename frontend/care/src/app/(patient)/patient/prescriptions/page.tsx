import { serverFetch } from '@/lib/server/api-client';
import { getSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import { Pill, Calendar } from 'lucide-react';

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function PrescriptionsPage() {
  const session = await getSession();
  if (!session || (!session.roles.includes('PATIENT') && !session.roles.includes('SUPER_ADMIN'))) {
    redirect('/login');
  }

  // Use /me/prescriptions — identity resolved from JWT server-side
  let prescriptions: any[] = [];
  const res = await serverFetch('/api/v1/encounters/me/prescriptions', { next: { revalidate: 0 } });
  if (res.ok && Array.isArray(res.data?.data)) {
    prescriptions = res.data.data.sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Pill className="w-5 h-5 text-[#007b92]" />
          Prescriptions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your prescription history from all visits. {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''} found.
        </p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
          <Pill className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">No prescriptions found</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Prescriptions from your doctor visits will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx: any) => (
            <div key={rx.id} className="rounded-xl border border-border bg-card p-5 hover:border-[#007b92]/20 transition-all">
              {/* Prescription Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-semibold text-foreground">
                    Prescription #{rx.prescriptionNumber}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {formatDate(rx.createdAt)}
                </div>
              </div>

              {rx.notes && (
                <p className="text-xs text-muted-foreground mb-4 italic">{rx.notes}</p>
              )}

              {/* Medication Items */}
              {rx.items && rx.items.length > 0 ? (
                <div className="space-y-3">
                  {rx.items.map((item: any, idx: number) => (
                    <div key={item.id || idx} className="rounded-lg border border-border/60 bg-accent/20 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-foreground">{item.medicineName}</p>
                        <span className="text-xs bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 px-2 py-0.5 rounded-full font-medium">
                          {item.duration}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Dosage</p>
                          <p className="font-semibold text-foreground">{item.dosage}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Frequency</p>
                          <p className="font-semibold text-foreground">{item.frequency}</p>
                        </div>
                        {item.route && (
                          <div>
                            <p className="text-muted-foreground">Route</p>
                            <p className="font-semibold text-foreground">{item.route}</p>
                          </div>
                        )}
                      </div>
                      {item.instructions && (
                        <p className="text-xs text-muted-foreground mt-2 italic">{item.instructions}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No medication items recorded.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
