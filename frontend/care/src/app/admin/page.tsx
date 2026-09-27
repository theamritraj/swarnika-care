import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { 
  Users, UserCheck, CalendarDays, Building2, 
  Stethoscope, AlertCircle, Clock, ArrowRight,
  ShieldCheck, CheckCircle2, ChevronRight, Activity
} from 'lucide-react';

interface Hospital {
  id: number;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  status: string;
}

interface Encounter {
  id: number;
  encounterNumber: string;
  patientId: number;
  hospitalId: number;
  doctorId?: number | null;
  encounterType: 'OPD' | 'EMERGENCY' | 'INPATIENT' | 'FOLLOW_UP';
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  source: string;
  chiefComplaint?: string;
  createdAt: string;
}

interface DashboardData {
  totalPatients: number | null;
  activeDoctors: number | null;
  totalAppointments: number | null;
  activeHospitals: number | null;
  todaysAppointments: number | null;
  todaysOpd: number | null;
  todaysEmergency: number | null;
  hospitals: Hospital[];
  recentEncounters: Encounter[];
}

async function fetchDashboardData(): Promise<DashboardData> {
  const cookieStore = await cookies();
  const token = cookieStore.get('swarnika_session')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const gatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:8080';
  const todayStr = new Date().toISOString().split('T')[0];

  let totalPatients: number | null = null;
  let activeDoctors: number | null = null;
  let totalAppointments: number | null = null;
  let activeHospitals: number | null = null;
  let todaysAppointments: number | null = null;
  let todaysOpd: number | null = null;
  let todaysEmergency: number | null = null;
  let hospitals: Hospital[] = [];
  let recentEncounters: Encounter[] = [];

  // 1. Fetch Patients from Patient Service
  try {
    const res = await fetch(`${gatewayUrl}/api/v1/patients`, { headers, cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        totalPatients = json.data.length;
      }
    }
  } catch (e) {
    console.error("Dashboard: Failed to fetch patients", e);
  }

  // 2. Fetch Doctors from Doctor Service (Active doctors defined as status !== 'INACTIVE')
  try {
    const res = await fetch(`${gatewayUrl}/api/v1/doctors`, { headers, cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        activeDoctors = json.data.filter((d: { status?: string }) => d.status !== 'INACTIVE').length;
      }
    }
  } catch (e) {
    console.error("Dashboard: Failed to fetch doctors", e);
  }

  // 3. Fetch Appointments from Appointment Service
  try {
    const res = await fetch(`${gatewayUrl}/api/v1/appointments`, { headers, cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        totalAppointments = json.data.length;
        todaysAppointments = json.data.filter((a: { appointmentDate?: string }) => a.appointmentDate === todayStr).length;
      }
    }
  } catch (e) {
    console.error("Dashboard: Failed to fetch appointments", e);
  }

  // 4. Fetch Hospitals from Organization Service (Active hospitals defined as status === 'ACTIVE')
  try {
    const res = await fetch(`${gatewayUrl}/api/v1/hospitals`, { headers, cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        hospitals = json.data;
        activeHospitals = json.data.filter((h: Hospital) => h.status === 'ACTIVE').length;
      }
    }
  } catch (e) {
    console.error("Dashboard: Failed to fetch hospitals", e);
  }

  // 5. Fetch Encounters from Encounter Service
  try {
    const res = await fetch(`${gatewayUrl}/api/v1/encounters`, { headers, cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        recentEncounters = json.data.slice(0, 5);
        todaysOpd = json.data.filter((e: Encounter) => e.encounterType === 'OPD' && (e.createdAt || '').startsWith(todayStr)).length;
        todaysEmergency = json.data.filter((e: Encounter) => e.encounterType === 'EMERGENCY' && (e.createdAt || '').startsWith(todayStr)).length;
      }
    }
  } catch (e) {
    console.error("Dashboard: Failed to fetch encounters", e);
  }

  return {
    totalPatients,
    activeDoctors,
    totalAppointments,
    activeHospitals,
    todaysAppointments,
    todaysOpd,
    todaysEmergency,
    hospitals,
    recentEncounters
  };
}

export default async function AdminDashboard() {
  const data = await fetchDashboardData();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Global Platform Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time enterprise metrics across Swarnika Care hospitals.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Super Admin Mode
          </span>
        </div>
      </div>

      {/* Top Real-time KPI Cards (No Fake Data / No Billing KPI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Patients */}
        <Link href="/admin/patients" className="bg-card p-5 rounded-xl border border-border shadow-sm hover:border-[#007b92]/50 transition block group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
              <h3 className="text-3xl font-bold text-card-foreground mt-1">
                {data.totalPatients !== null ? data.totalPatients : <span className="text-muted-foreground/60 text-lg">N/A</span>}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Patient Service</span>
            <span className="text-[#007b92] font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">View directory <ChevronRight className="w-3.5 h-3.5" /></span>
          </div>
        </Link>

        {/* Active Doctors */}
        <Link href="/admin/doctors" className="bg-card p-5 rounded-xl border border-border shadow-sm hover:border-[#007b92]/50 transition block group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Doctors</p>
              <h3 className="text-3xl font-bold text-card-foreground mt-1">
                {data.activeDoctors !== null ? data.activeDoctors : <span className="text-muted-foreground/60 text-lg">N/A</span>}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Doctor Service</span>
            <span className="text-[#007b92] font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">View directory <ChevronRight className="w-3.5 h-3.5" /></span>
          </div>
        </Link>

        {/* Total Appointments */}
        <Link href="/admin/appointments" className="bg-card p-5 rounded-xl border border-border shadow-sm hover:border-[#007b92]/50 transition block group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
              <h3 className="text-3xl font-bold text-card-foreground mt-1">
                {data.totalAppointments !== null ? data.totalAppointments : <span className="text-muted-foreground/60 text-lg">N/A</span>}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-105 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Appointment Service</span>
            <span className="text-[#007b92] font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">View bookings <ChevronRight className="w-3.5 h-3.5" /></span>
          </div>
        </Link>

        {/* Active Hospitals (Replaces Pending Bills) */}
        <Link href="/admin/hospitals" className="bg-card p-5 rounded-xl border border-border shadow-sm hover:border-[#007b92]/50 transition block group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Hospitals</p>
              <h3 className="text-3xl font-bold text-card-foreground mt-1">
                {data.activeHospitals !== null ? data.activeHospitals : <span className="text-muted-foreground/60 text-lg">N/A</span>}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#007b92]/10 flex items-center justify-center text-[#007b92] group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Organization Service</span>
            <span className="text-[#007b92] font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">Manage facilities <ChevronRight className="w-3.5 h-3.5" /></span>
          </div>
        </Link>

      </div>

      {/* Today's Operations Section */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#007b92]" />
              Today's Operations
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Current day aggregates across all facilities (Dynamic: {new Date().toISOString().split('T')[0]}).</p>
          </div>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
            Live Daily Aggregate
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          {/* Today's Appointments */}
          <div className="bg-background rounded-lg border border-border p-4">
            <span className="text-xs font-medium text-muted-foreground block">Appointments</span>
            <p className="text-2xl font-bold text-card-foreground mt-1">
              {data.todaysAppointments !== null ? data.todaysAppointments : '0'}
            </p>
            <span className="text-[11px] text-muted-foreground/80 mt-1 block">Scheduled today</span>
          </div>

          {/* OPD Encounters */}
          <div className="bg-background rounded-lg border border-border p-4">
            <span className="text-xs font-medium text-muted-foreground block">OPD Encounters</span>
            <p className="text-2xl font-bold text-card-foreground mt-1">
              {data.todaysOpd !== null ? data.todaysOpd : '0'}
            </p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">Outpatient visits</span>
          </div>

          {/* Emergency Encounters */}
          <div className="bg-background rounded-lg border border-border p-4">
            <span className="text-xs font-medium text-muted-foreground block">Emergency Triage</span>
            <p className="text-2xl font-bold text-card-foreground mt-1">
              {data.todaysEmergency !== null ? data.todaysEmergency : '0'}
            </p>
            <span className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-1 block">Acute trauma / ER</span>
          </div>

          {/* Inpatient Admissions (Phase 5) */}
          <div className="bg-background/50 rounded-lg border border-dashed border-border p-4 relative opacity-80">
            <span className="text-xs font-medium text-muted-foreground block">Admissions</span>
            <p className="text-2xl font-bold text-muted-foreground/60 mt-1">—</p>
            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              Phase 5 — IPD
            </span>
          </div>

          {/* Inpatient Discharges (Phase 5) */}
          <div className="bg-background/50 rounded-lg border border-dashed border-border p-4 relative opacity-80">
            <span className="text-xs font-medium text-muted-foreground block">Discharges</span>
            <p className="text-2xl font-bold text-muted-foreground/60 mt-1">—</p>
            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              Phase 5 — IPD
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Hospital Overview & Recent Clinical Encounters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Hospital Overview Table */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#007b92]" />
                  Hospital Facilities Overview
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Authoritative branches registered in Organization Service.</p>
              </div>
              <Link href="/admin/hospitals" className="text-xs text-[#007b92] hover:underline font-medium">
                View all ({data.hospitals.length})
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-background border-y border-border text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2 font-medium">Facility</th>
                    <th className="px-3 py-2 font-medium">Code</th>
                    <th className="px-3 py-2 font-medium">Contact</th>
                    <th className="px-3 py-2 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.hospitals.length > 0 ? (
                    data.hospitals.map((h) => (
                      <tr key={h.id} className="hover:bg-background/80 transition">
                        <td className="px-3 py-3">
                          <div className="font-medium text-card-foreground">{h.name}</div>
                          <div className="text-xs text-muted-foreground">{h.city || 'Bihar'}, {h.state || 'India'}</div>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-[#007b92]">
                          {h.code}
                        </td>
                        <td className="px-3 py-3 text-xs text-card-foreground/80">
                          <div>{h.phone || 'N/A'}</div>
                          <div className="text-muted-foreground/70">{h.email || 'N/A'}</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            h.status === 'ACTIVE' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              h.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-muted-foreground'
                            }`}></span>
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground text-xs">
                        No hospital facilities registered in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-end text-xs text-muted-foreground">
            <Link href="/admin/hospitals" className="text-[#007b92] hover:underline font-medium flex items-center gap-1">
              Manage branches <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Live Recent Encounters (Encounter Service Foundation) */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#007b92]" />
                  Latest Clinical Encounters
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Recent clinical consultations & triage events across all hospitals.</p>
              </div>
              <span className="text-xs font-medium text-[#007b92] bg-[#007b92]/10 px-2 py-0.5 rounded-full">
                Recent Records ({data.recentEncounters.length})
              </span>
            </div>

            <div className="space-y-3">
              {data.recentEncounters.length > 0 ? (
                data.recentEncounters.map((enc) => (
                  <div key={enc.id} className="p-3 bg-background rounded-lg border border-border flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        enc.encounterType === 'EMERGENCY'
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                      }`}>
                        {enc.encounterType === 'EMERGENCY' ? <AlertCircle className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-semibold text-card-foreground">{enc.encounterNumber}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            enc.encounterType === 'EMERGENCY' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                          }`}>
                            {enc.encounterType}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {enc.chiefComplaint || 'Consultation in progress'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        enc.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                        enc.status === 'CANCELLED' ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' :
                        enc.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                        'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}>
                        {enc.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground text-xs">
                  No recent encounters recorded.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-end text-xs text-muted-foreground">
            <Link href="/admin/appointments" className="text-[#007b92] hover:underline font-medium flex items-center gap-1">
              View appointments & encounters <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
