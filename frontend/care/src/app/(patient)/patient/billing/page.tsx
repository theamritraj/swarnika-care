import { serverFetch } from '@/lib/server/api-client';
import { getSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Receipt, CreditCard, TrendingUp, AlertCircle, CheckCircle2, Clock, ChevronRight, IndianRupee } from 'lucide-react';

function formatAmount(amount: number) {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    ISSUED: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    PAID: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
    PARTIALLY_PAID: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    CANCELLED: 'bg-slate-100 text-slate-600',
    DRAFT: 'bg-slate-100 text-slate-600',
    REFUNDED: 'bg-violet-100 text-violet-700',
  };
  return map[status?.toUpperCase()] || 'bg-accent text-muted-foreground';
}

export default async function BillingPage() {
  const session = await getSession();
  if (!session || (!session.roles.includes('PATIENT') && !session.roles.includes('SUPER_ADMIN'))) {
    redirect('/login');
  }

  const [summaryRes, invoicesRes, paymentsRes] = await Promise.all([
    serverFetch('/api/v1/billing/me/summary', { next: { revalidate: 0 } }),
    serverFetch('/api/v1/billing/me/invoices', { next: { revalidate: 0 } }),
    serverFetch('/api/v1/billing/me/payments', { next: { revalidate: 0 } }),
  ]);

  const summary = summaryRes.ok ? summaryRes.data?.data : null;
  const invoices: any[] = invoicesRes.ok && Array.isArray(invoicesRes.data?.data) ? invoicesRes.data.data : [];
  const payments: any[] = paymentsRes.ok && Array.isArray(paymentsRes.data?.data) ? paymentsRes.data.data.slice(0, 5) : [];

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Receipt className="w-5 h-5 text-[#007b92]" />
          Billing & Payments
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your invoices, payments, and billing history.
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Outstanding</p>
            </div>
            <p className="text-2xl font-black text-foreground">{formatAmount(summary.outstandingAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">{summary.pendingInvoices} pending invoice{summary.pendingInvoices !== 1 ? 's' : ''}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#007b92]/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#007b92]" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Invoices</p>
            </div>
            <p className="text-2xl font-black text-foreground">{summary.totalInvoices}</p>
            <p className="text-xs text-muted-foreground mt-1">{summary.paidInvoices} paid</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Paid Invoices</p>
            </div>
            <p className="text-2xl font-black text-foreground">{summary.paidInvoices}</p>
            <p className="text-xs text-muted-foreground mt-1">of {summary.totalInvoices} total</p>
          </div>
        </div>
      )}

      {/* Recent Invoices */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Recent Invoices</h2>
          {invoices.length > 5 && (
            <Link href="/patient/billing/invoices" className="text-xs text-[#007b92] hover:underline">
              View all {invoices.length}
            </Link>
          )}
        </div>
        {invoices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 py-12 text-center">
            <Receipt className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No invoices found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentInvoices.map((inv: any) => (
              <Link
                key={inv.id}
                href={`/patient/billing/${inv.id}`}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card hover:border-[#007b92]/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#007b92]/10 flex items-center justify-center shrink-0">
                    <Receipt className="w-4 h-4 text-[#007b92]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{inv.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(inv.issuedAt || inv.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{formatAmount(inv.totalAmount)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${getStatusBadge(inv.status)}`}>
                      {inv.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Payments */}
      {payments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Recent Payments</h2>
            <Link href="/patient/billing/payments" className="text-xs text-[#007b92] hover:underline">
              View all
            </Link>
          </div>
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
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">
                    -{formatAmount(pmt.amount)}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                    pmt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>{pmt.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
