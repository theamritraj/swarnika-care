'use client';

import React, { useEffect, useState } from 'react';
import {
  CalendarClock,
  RefreshCw,
  AlertCircle,
  Hospital,
  Clock,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface AvailabilitySlot {
  id: number;
  doctorId: number;
  hospitalId: number;
  departmentId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const DAYS_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function DoctorSchedulePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);

  const fetchAvailability = async () => {
    setLoading(true);
    setError(null);
    try {
      const meRes = await fetch('/api/proxy/api/v1/doctors/me');
      if (!meRes.ok) throw new Error('Doctor profile verification failed');
      const doc = (await meRes.json()).data;

      const availRes = await fetch(`/api/proxy/api/v1/doctors/${doc.id}/availability`);
      if (!availRes.ok) throw new Error('Failed to load doctor availability schedule');
      const availJson = await availRes.json();
      const slots: AvailabilitySlot[] = availJson.data || [];

      // Sort by week order
      slots.sort((a, b) => DAYS_ORDER.indexOf(a.dayOfWeek) - DAYS_ORDER.indexOf(b.dayOfWeek));
      setAvailability(slots);
    } catch (err: any) {
      setError(err.message || 'Error loading schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Availability Schedule
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your weekly duty roster and consultation booking slots configured by hospital administration.
          </p>
        </div>
        <button
          onClick={fetchAvailability}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 text-teal-600" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Admin Managed Policy Disclaimer */}
      <div className="flex items-center gap-2.5 rounded-lg border border-teal-200/80 bg-teal-50/50 p-3.5 text-xs text-teal-900 dark:border-teal-900/60 dark:bg-teal-950/20 dark:text-teal-300">
        <Lock className="h-4 w-4 shrink-0 text-teal-600" />
        <span>
          <strong>Admin-Managed Roster:</strong> Clinical availability and consultation hours are administered centrally by Hospital Administration. To request changes or leave coverage, please contact the Medical Administration department.
        </span>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-base font-bold text-foreground">Weekly Roster</h3>
          <p className="text-xs text-muted-foreground">Standard active duty hours by day of week</p>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted/60 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        ) : availability.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarClock className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No Availability Configured</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              You do not have any active clinical shifts assigned in the system.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {DAYS_ORDER.map((day) => {
              const slot = availability.find((a) => a.dayOfWeek === day);
              const isWorkingDay = Boolean(slot && slot.isActive);

              return (
                <div
                  key={day}
                  className={`p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isWorkingDay ? 'hover:bg-muted/20' : 'bg-muted/10 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                        isWorkingDay
                          ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {day.substring(0, 2)}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-foreground">{day}</span>
                      <p className="text-xs text-muted-foreground">
                        {isWorkingDay
                          ? `Hospital Assignment: #${slot?.hospitalId || 101} • Cardiology`
                          : 'Off-Duty Day'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {isWorkingDay ? (
                      <div className="flex items-center gap-2 font-mono text-xs font-semibold text-foreground bg-muted/40 px-3 py-1 rounded-md border border-border">
                        <Clock className="h-3.5 w-3.5 text-teal-600" />
                        <span>
                          {slot?.startTime.substring(0, 5)} - {slot?.endTime.substring(0, 5)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No Clinic Scheduled</span>
                    )}

                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        isWorkingDay
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isWorkingDay ? 'ACTIVE DUTY' : 'OFF'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
