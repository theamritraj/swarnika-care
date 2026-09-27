import { serverFetch } from '@/lib/server/api-client';
import { getSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, ArrowLeft } from 'lucide-react';

function formatAmount(amount: number) {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function AllPaymentsPage() {
  const session = await getSession();
  if (!session || (!session.roles.includes('PATIENT') && !session.roles.includes('SUPER_ADMIN'))) {
    redirect('/login');
  }

  const res = await serverFetch('/api/v1/billing/me/payments', { next: { revalidate: 0 } });
  const payments: any[] = res.ok && Array.isArray(res.data?.data) ? res.data.data : [];

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-3">
        <Link href="/patient/billing" className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            Payment History
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete record of your payments
          </p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 py-12 text-center">
          <CreditCard className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No payments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((pmt: any) => (
            <div key={pmt.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{pmt.paymentNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {pmt.paymentMethod?.replace('_', ' ')} · {formatDate(pmt.paidAt || pmt.createdAt)}
                  </p>
                  {pmt.transactionRef && (
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">Ref: {pmt.transactionRef}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  -{formatAmount(pmt.amount)}
                </p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase mt-1 inline-block ${
                  pmt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                }`}>{pmt.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
