import { serverFetch } from '@/lib/server/api-client';
import { getSession } from '@/lib/server/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Receipt, ArrowLeft, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';

function formatAmount(amount: number) {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
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

export default async function InvoiceDetailPage({ params }: { params: { invoiceId: string } }) {
  const session = await getSession();
  if (!session || (!session.roles.includes('PATIENT') && !session.roles.includes('SUPER_ADMIN'))) {
    redirect('/login');
  }

  const res = await serverFetch(`/api/v1/billing/me/invoices/${params.invoiceId}`, { next: { revalidate: 0 } });
  if (!res.ok || !res.data?.data) {
    notFound();
  }
  const inv = res.data.data;
  const items: any[] = Array.isArray(inv.items) ? inv.items : [];

  return (
    <div className="space-y-6 pb-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/patient/billing" className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-foreground">Invoice {inv.invoiceNumber}</h1>
          <p className="text-xs text-muted-foreground">Issued {formatDate(inv.issuedAt || inv.createdAt)}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(inv.status)}`}>
          {inv.status?.replace('_', ' ')}
        </span>
      </div>

      {/* Invoice Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border bg-accent/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Invoice</p>
              <p className="text-base font-bold text-foreground">{inv.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Date</p>
              <p className="text-sm font-semibold text-foreground">{formatDate(inv.issuedAt)}</p>
            </div>
          </div>
          {inv.dueAt && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground">
                Due: <span className="font-medium text-foreground">{formatDate(inv.dueAt)}</span>
              </p>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Items</h3>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No line items recorded.</p>
          ) : (
            <div className="space-y-2">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide pb-2 border-b border-border">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-3 text-right">Total</div>
              </div>
              {items.map((item: any, i: number) => (
                <div key={item.id || i} className="grid grid-cols-12 gap-2 text-xs py-2 border-b border-border/40 last:border-0">
                  <div className="col-span-5">
                    <p className="font-medium text-foreground">{item.description}</p>
                    <p className="text-muted-foreground">{item.itemType}</p>
                  </div>
                  <div className="col-span-2 text-right text-foreground">{item.quantity}</div>
                  <div className="col-span-2 text-right text-foreground">{formatAmount(item.unitPrice)}</div>
                  <div className="col-span-3 text-right font-semibold text-foreground">{formatAmount(item.lineTotal)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="p-5 border-t border-border bg-accent/10">
          <div className="space-y-2 text-sm">
            {inv.subtotal !== inv.totalAmount && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatAmount(inv.subtotal)}</span>
                </div>
                {inv.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">{formatAmount(inv.taxAmount)}</span>
                  </div>
                )}
                {inv.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span className="font-medium">-{formatAmount(inv.discountAmount)}</span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between pt-2 border-t border-border font-bold text-base">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">{formatAmount(inv.totalAmount)}</span>
            </div>
            {inv.paidAmount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Paid</span>
                <span className="font-medium">-{formatAmount(inv.paidAmount)}</span>
              </div>
            )}
            {inv.outstandingAmount > 0 && (
              <div className="flex justify-between pt-2 border-t border-border font-bold text-red-600 dark:text-red-400">
                <span>Outstanding</span>
                <span>{formatAmount(inv.outstandingAmount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Paid indicator */}
        {inv.status === 'PAID' && (
          <div className="px-5 py-3 bg-green-50 dark:bg-green-950/20 border-t border-green-200 dark:border-green-900">
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Paid on {formatDate(inv.paidAt)}
            </div>
          </div>
        )}
      </div>

      {/* Payment Contact */}
      <div className="rounded-lg border border-border bg-card/50 p-4">
        <p className="text-xs text-muted-foreground flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          For payment queries, please contact the hospital billing counter. Online payment initiation coming soon.
        </p>
      </div>
    </div>
  );
}
