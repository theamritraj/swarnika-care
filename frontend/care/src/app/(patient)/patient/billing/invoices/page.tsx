import { serverFetch } from '@/lib/server/api-client';
import { getSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Receipt, ArrowLeft, ChevronRight } from 'lucide-react';

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
    REFUNDED: 'bg-violet-100 text-violet-700',
  };
  return map[status?.toUpperCase()] || 'bg-accent text-muted-foreground';
}

export default async function AllInvoicesPage() {
  const session = await getSession();
  if (!session || (!session.roles.includes('PATIENT') && !session.roles.includes('SUPER_ADMIN'))) {
    redirect('/login');
  }

  const res = await serverFetch('/api/v1/billing/me/invoices', { next: { revalidate: 0 } });
  const invoices: any[] = res.ok && Array.isArray(res.data?.data) ? res.data.data : [];

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-3">
        <Link href="/patient/billing" className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            All Invoices
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete billing history
          </p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 py-12 text-center">
          <Receipt className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No invoices found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv: any) => (
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
  );
}
