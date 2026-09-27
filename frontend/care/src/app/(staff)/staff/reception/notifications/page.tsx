'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Send,
  Clock,
  ShieldCheck,
  Calendar,
  UserCheck
} from 'lucide-react';

interface NotificationLog {
  id: string;
  type: string;
  recipient: string;
  title: string;
  message: string;
  status: 'SENT' | 'QUEUED' | 'DELIVERED';
  timestamp: string;
}

export default function ReceptionNotificationsPage() {
  const [logs] = useState<NotificationLog[]>([
    {
      id: 'NOTIF-8001',
      type: 'APPOINTMENT_CONFIRMED',
      recipient: 'patient@swarnika.com (+91 9876543210)',
      title: 'OPD Appointment Confirmation',
      message: 'Your consultation with Dr. Practitioner is confirmed for today at 10:00 AM.',
      status: 'DELIVERED',
      timestamp: 'Today, 09:30 AM',
    },
    {
      id: 'NOTIF-8002',
      type: 'CHECK_IN_NOTICE',
      recipient: 'OPD Clinical Station (Sasaram Branch)',
      title: 'Patient Checked In to Waiting Room',
      message: 'Token APT-1002 has been checked in and assigned to OPD Room 102.',
      status: 'SENT',
      timestamp: 'Today, 10:02 AM',
    },
    {
      id: 'NOTIF-8003',
      type: 'EMERGENCY_DISPATCH',
      recipient: 'Casualty On-Call Team',
      title: 'Emergency Arrival Alert',
      message: 'Acute trauma intake registered at front desk. Wheelchair assistance dispatched.',
      status: 'DELIVERED',
      timestamp: 'Today, 10:45 AM',
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Front Desk Communications & Alert Dispatches
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Auditable record of automated SMS/Email triggers and operational dispatch alerts.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dispatches Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-[#007b92] flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{logs.length}</div>
          <span className="text-[11px] text-muted-foreground">Automated notification events</span>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Delivery Success
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">100%</div>
          <span className="text-[11px] text-muted-foreground">Via Swarnika Notification Service</span>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Channels Active
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-foreground">Email & SMS</div>
          <span className="text-[11px] text-muted-foreground">Transactional gateway ready</span>
        </div>
      </div>

      {/* Dispatched Logs Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#007b92]" />
            <h2 className="text-sm font-bold text-foreground">Recent Notification Activity</h2>
          </div>
          <span className="text-xs text-muted-foreground">Synchronized with Notification Service</span>
        </div>

        <div className="divide-y divide-border/60">
          {logs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-foreground">{log.title}</span>
                  <span className="px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-muted-foreground">
                    {log.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">{log.timestamp}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                    {log.status}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{log.message}</p>
              <p className="text-[11px] font-mono text-[#007b92] mt-1">Recipient: {log.recipient}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
