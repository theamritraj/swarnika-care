import { serverFetch } from '@/lib/server/api-client';
import { getSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import { Bell, Calendar, Pill, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

function formatDateTime(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function getNotifIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'appointment': return <Calendar className="w-4 h-4 text-blue-500" />;
    case 'prescription': return <Pill className="w-4 h-4 text-violet-500" />;
    case 'alert': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    default: return <Info className="w-4 h-4 text-[#007b92]" />;
  }
}

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session || (!session.roles.includes('PATIENT') && !session.roles.includes('SUPER_ADMIN'))) {
    redirect('/login');
  }

  // Try to fetch notifications from notification service
  let notifications: any[] = [];
  try {
    const res = await serverFetch('/api/v1/notifications/me', { next: { revalidate: 0 } });
    if (res.ok && Array.isArray(res.data?.data)) {
      notifications = res.data.data.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch {
    // notification service may not expose /me endpoint — gracefully empty
  }

  return (
    <div className="space-y-6 pb-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#007b92]" />
          Notifications
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          System alerts, appointment reminders, and health updates.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
          <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">No notifications yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Appointment confirmations and health alerts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif: any) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                notif.read
                  ? 'border-border bg-card'
                  : 'border-[#007b92]/20 bg-[#007b92]/5 dark:bg-[#007b92]/10'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                {getNotifIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                {notif.title && (
                  <p className={`text-sm font-semibold mb-0.5 ${notif.read ? 'text-foreground' : 'text-foreground'}`}>
                    {notif.title}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">{notif.message || notif.body}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                  {formatDateTime(notif.createdAt)}
                </p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-[#007b92] shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
