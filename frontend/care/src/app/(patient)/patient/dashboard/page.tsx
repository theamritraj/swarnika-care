import { serverFetch } from '@/lib/server/api-client';
import { getSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Stethoscope,
  Pill,
  Search,
  User,
  Activity,
  ClipboardList,
} from 'lucide-react';

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(timeStr: string) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hr = parseInt(h, 10);
  const suffix = hr >= 12 ? 'PM' : 'AM';
  const hour = hr % 12 || 12;
  return `${hour}:${m} ${suffix}`;
}

function getStatusColor(status: string) {
  switch (status?.toUpperCase()) {
    case 'CONFIRMED': return 'text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400';
    case 'SCHEDULED': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400';
    case 'PENDING': return 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400';
    case 'CANCELLED': return 'text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400';
    case 'COMPLETED': return 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400';
    default: return 'text-muted-foreground bg-accent';
  }
}

export default async function PatientDashboard() {
  const session = await getSession();
  if (!session || (!session.roles.includes('PATIENT') && !session.roles.includes('SUPER_ADMIN'))) {
    redirect('/login');
  }

  // Fetch patient profile
  const profileRes = await serverFetch('/api/v1/patients/me', { next: { revalidate: 0 } });
  const patient = profileRes.ok ? profileRes.data?.data : null;

  // Fetch appointments if we have a patient ID
  let upcomingAppointments: any[] = [];
  let recentAppointments: any[] = [];
  if (patient?.id) {
    const apptRes = await serverFetch(`/api/v1/appointments/patient/${patient.id}`, { next: { revalidate: 0 } });
    if (apptRes.ok && Array.isArray(apptRes.data?.data)) {
      const all = apptRes.data.data;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      upcomingAppointments = all
        .filter((a: any) => {
          const apptDate = new Date(a.appointmentDate);
          return apptDate >= today && !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(a.status);
        })
        .sort((a: any, b: any) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
        .slice(0, 3);

      recentAppointments = all
        .filter((a: any) => ['COMPLETED', 'CANCELLED'].includes(a.status))
        .sort((a: any, b: any) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
        .slice(0, 4);
    }
  }

  // Fetch recent encounters/prescriptions
  let recentPrescriptions: any[] = [];
  if (patient?.id) {
    const presRes = await serverFetch(`/api/v1/encounters/prescriptions/patient/${patient.id}`, { next: { revalidate: 0 } });
    if (presRes.ok && Array.isArray(presRes.data?.data)) {
      recentPrescriptions = presRes.data.data.slice(0, 3);
    }
  }

  const patientName = patient ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() : 'Patient';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const stats = [
    {
      label: 'Upcoming Appointments',
      value: upcomingAppointments.length,
      icon: Calendar,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      href: '/patient/appointments',
    },
    {
      label: 'Recent Visits',
      value: recentAppointments.length,
      icon: Activity,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/30',
      href: '/patient/records',
    },
    {
      label: 'Active Prescriptions',
      value: recentPrescriptions.length,
      icon: Pill,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/30',
      href: '/patient/prescriptions',
    },
    {
      label: 'MRN',
      value: patient?.mrn || '—',
      icon: ClipboardList,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-100 dark:bg-slate-800',
      href: '/patient/profile',
    },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#007b92] to-[#00566a] p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-medium text-white/70 mb-1">{greeting},</p>
            <h1 className="text-2xl font-bold">{patientName}</h1>
            {patient?.mrn && (
              <p className="text-sm text-white/60 mt-1">Patient ID: {patient.mrn}</p>
            )}
          </div>
          <Link
            href="/patient/doctors"
            className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-sm font-semibold transition-colors backdrop-blur-sm"
          >
            <Search className="w-4 h-4" />
            Book Appointment
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-all hover:border-[#007b92]/30 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-[#007b92] transition-colors" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-0.5">{stat.value}</div>
              <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#007b92]" />
              Upcoming Appointments
            </h2>
            <Link
              href="/patient/appointments"
              className="text-xs text-[#007b92] hover:underline font-medium flex items-center gap-1"
            >
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No upcoming appointments</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Book an appointment with a specialist</p>
              <Link
                href="/patient/doctors"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#007b92] text-white text-xs font-semibold rounded-lg hover:bg-[#006274] transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                Find Doctors
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appt: any) => (
                <div
                  key={appt.id}
                  className="flex items-center gap-4 p-3.5 rounded-xl bg-accent/30 border border-border/50 hover:border-[#007b92]/20 hover:bg-accent/50 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#007b92]/10 flex flex-col items-center justify-center text-[#007b92] shrink-0">
                    <span className="text-base font-bold leading-none">
                      {new Date(appt.appointmentDate).getDate()}
                    </span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider opacity-70">
                      {new Date(appt.appointmentDate).toLocaleString('default', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {appt.reason || 'General Consultation'}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(appt.startTime)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        #{appt.appointmentNumber}
                      </span>
                    </div>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusColor(appt.status)}`}>
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions + Recent Prescriptions */}
        <div className="flex flex-col gap-4">
          {/* Quick Actions */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Book Appointment', href: '/patient/doctors', icon: Search, color: 'text-[#007b92]' },
                { label: 'View Prescriptions', href: '/patient/prescriptions', icon: Pill, color: 'text-violet-600 dark:text-violet-400' },
                { label: 'Medical Records', href: '/patient/records', icon: Stethoscope, color: 'text-teal-600 dark:text-teal-400' },
                { label: 'Update Profile', href: '/patient/profile', icon: User, color: 'text-slate-600 dark:text-slate-400' },
              ].map(action => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                  >
                    <Icon className={`w-4 h-4 ${action.color} shrink-0`} />
                    <span className="text-sm text-foreground font-medium group-hover:text-[#007b92] transition-colors">
                      {action.label}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 ml-auto group-hover:text-[#007b92] transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Prescriptions mini-card */}
          {recentPrescriptions.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Pill className="w-4 h-4 text-violet-500" />
                  Recent Rx
                </h2>
                <Link
                  href="/patient/prescriptions"
                  className="text-xs text-[#007b92] hover:underline font-medium"
                >
                  All
                </Link>
              </div>
              <div className="space-y-2">
                {recentPrescriptions.map((rx: any) => (
                  <div key={rx.id} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {rx.medicationName || 'Prescription'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{rx.dosage} · {rx.frequency}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Visit History */}
      {recentAppointments.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#007b92]" />
              Recent Visit History
            </h2>
            <Link href="/patient/records" className="text-xs text-[#007b92] hover:underline font-medium flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {recentAppointments.map((appt: any) => (
              <div key={appt.id} className="py-3 flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {appt.reason || 'General Consultation'}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(appt.appointmentDate)}</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${getStatusColor(appt.status)}`}>
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
