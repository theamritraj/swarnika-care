'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Calendar,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'APPOINTMENT' | 'ORDER' | 'ENCOUNTER' | 'SYSTEM';
  read: boolean;
  link?: string;
}

export default function DoctorNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const generateRealNotifications = async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/proxy/api/v1/doctors/me');
      if (!meRes.ok) return;
      const doc = (await meRes.json()).data;

      // Fetch appointments & orders to generate live notification events
      const [apptRes, encRes] = await Promise.all([
        fetch(`/api/proxy/api/v1/appointments/doctor/${doc.id}`),
        fetch(`/api/proxy/api/v1/encounters/doctor/${doc.id}`),
      ]);

      const appts = apptRes.ok ? (await apptRes.json()).data || [] : [];
      const encs = encRes.ok ? (await encRes.json()).data || [] : [];

      const notifs: NotificationItem[] = [];

      // Notifications from appointments
      appts.forEach((a: any) => {
        if (a.status === 'CONFIRMED') {
          notifs.push({
            id: `appt-${a.id}`,
            title: 'New Confirmed Appointment',
            message: `Appointment ${a.appointmentNumber} scheduled for ${a.appointmentDate} at ${a.startTime || '09:00'}.`,
            timestamp: a.createdAt || new Date().toISOString(),
            type: 'APPOINTMENT',
            read: false,
            link: '/doctor/appointments',
          });
        }
      });

      // Notifications from encounters
      encs.forEach((e: any) => {
        if (e.status === 'COMPLETED') {
          notifs.push({
            id: `enc-${e.id}`,
            title: 'Encounter Finalized & Signed',
            message: `Clinical encounter ${e.encounterNumber} has been finalized and archived.`,
            timestamp: e.endedAt || e.createdAt,
            type: 'ENCOUNTER',
            read: true,
            link: `/doctor/consultation/${e.id}`,
          });
        }
      });

      // Sort newest first
      notifs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      setNotifications(notifs);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateRealNotifications();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Clinical Notifications
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time updates regarding new bookings, patient check-ins, and diagnostic results.
          </p>
        </div>
        <button
          onClick={generateRealNotifications}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 text-teal-600" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No Notifications</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              You are completely caught up! New clinical alerts will appear here as they occur.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 sm:px-6 flex items-start justify-between gap-4 hover:bg-muted/20 transition-colors ${
                  !n.read ? 'bg-teal-50/30 dark:bg-teal-950/10' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      n.type === 'APPOINTMENT'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : n.type === 'ORDER'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {n.type === 'APPOINTMENT' ? (
                      <Calendar className="h-4 w-4" />
                    ) : n.type === 'ORDER' ? (
                      <FlaskConical className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{n.title}</span>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                    <span className="text-[10px] text-muted-foreground/70 font-mono">
                      {n.timestamp?.split('T')[0]} • {n.timestamp?.split('T')[1]?.substring(0, 5) || ''}
                    </span>
                  </div>
                </div>

                {n.link && (
                  <Link
                    href={n.link}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted shrink-0"
                  >
                    <span>View</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
