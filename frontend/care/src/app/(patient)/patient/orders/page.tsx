import { serverFetch } from '@/lib/server/api-client';
import { getSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import { FlaskConical, Calendar } from 'lucide-react';

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getOrderStatusBadge(status: string) {
  const map: Record<string, string> = {
    ORDERED: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    PENDING: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    VERIFIED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  };
  return map[status?.toUpperCase()] || 'bg-accent text-muted-foreground';
}

function getTypeIcon(type: string) {
  if (type?.toLowerCase().includes('imaging') || type?.toLowerCase().includes('radiology') || type?.toLowerCase().includes('xray')) return '🫁';
  return '🧪';
}

export default async function LabOrdersPage() {
  const session = await getSession();
  if (!session || (!session.roles.includes('PATIENT') && !session.roles.includes('SUPER_ADMIN'))) {
    redirect('/login');
  }

  // Use /me/orders — identity resolved from JWT server-side
  let orders: any[] = [];
  const res = await serverFetch('/api/v1/encounters/me/orders', { next: { revalidate: 0 } });
  if (res.ok && Array.isArray(res.data?.data)) {
    orders = res.data.data.sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const labOrders = orders.filter(o =>
    !o.orderType?.toLowerCase().includes('imaging') &&
    !o.orderType?.toLowerCase().includes('radiology') &&
    !o.orderType?.toLowerCase().includes('xray')
  );
  const imagingOrders = orders.filter(o =>
    o.orderType?.toLowerCase().includes('imaging') ||
    o.orderType?.toLowerCase().includes('radiology') ||
    o.orderType?.toLowerCase().includes('xray')
  );

  const OrderCard = ({ order }: { order: any }) => (
    <div className="rounded-xl border border-border bg-card p-5 hover:border-[#007b92]/20 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{getTypeIcon(order.orderType)}</span>
          <div>
            <h3 className="text-sm font-bold text-foreground">{order.testName || order.orderNumber || 'Order'}</h3>
            {order.orderType && (
              <p className="text-xs text-muted-foreground capitalize">{order.orderType?.toLowerCase().replace(/_/g, ' ')}</p>
            )}
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${getOrderStatusBadge(order.status)}`}>
          {order.status}
        </span>
      </div>

      {order.clinicalIndication && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          <span className="font-medium">Indication: </span>{order.clinicalIndication}
        </p>
      )}

      {order.priority && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
            order.priority === 'STAT' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {order.priority}
          </span>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <Calendar className="w-3 h-3" />
        Ordered: {formatDate(order.createdAt)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-[#007b92]" />
          Lab & Imaging Orders
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your diagnostic test and imaging orders. {orders.length} order{orders.length !== 1 ? 's' : ''} found.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
          <FlaskConical className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">No lab orders found</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Lab and imaging orders from your doctor will appear here.</p>
        </div>
      ) : (
        <>
          {labOrders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-base">🧪</span> Lab Tests ({labOrders.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {labOrders.map(o => <OrderCard key={o.id} order={o} />)}
              </div>
            </div>
          )}
          {imagingOrders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-base">🫁</span> Imaging Orders ({imagingOrders.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {imagingOrders.map(o => <OrderCard key={o.id} order={o} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
