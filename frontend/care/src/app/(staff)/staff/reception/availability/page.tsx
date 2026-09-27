'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useReceptionSidebar } from '../components/ReceptionSidebarContext';
import {
  CalendarClock,
  Search,
  Filter,
  Stethoscope,
  Building2,
  Calendar,
  Clock,
  RefreshCw,
  AlertTriangle,
  CalendarPlus
} from 'lucide-react';

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialization?: string;
  departmentId?: number;
  hospitalId?: number;
}

interface Department {
  id: number;
  name: string;
}

interface Availability {
  id: number;
  doctorId: number;
  hospitalId?: number;
  departmentId?: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  status: string;
}

export default function ReceptionAvailabilityPage() {
  const { activeHospitalId } = useReceptionSidebar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);

  // Filters
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('ALL');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');
  const [selectedDay, setSelectedDay] = useState<string>('ALL');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [docRes, deptRes, avRes] = await Promise.all([
        fetch('/api/proxy/api/v1/doctors'),
        fetch('/api/proxy/api/v1/departments'),
        fetch('/api/proxy/api/v1/doctors/availability'),
      ]);

      if (docRes.ok) {
        const dData = await docRes.json();
        setDoctors(dData.data || []);
      }
      if (deptRes.ok) {
        const depData = await deptRes.json();
        setDepartments(depData.data || []);
      }
      if (avRes.ok) {
        const aData = await avRes.json();
        setAvailabilities(aData.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load doctor availability schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeHospitalId]);

  const docMap = useMemo(() => {
    const map: Record<number, Doctor> = {};
    doctors.forEach((d) => {
      map[d.id] = d;
    });
    return map;
  }, [doctors]);

  const deptMap = useMemo(() => {
    const map: Record<number, Department> = {};
    departments.forEach((dep) => {
      map[dep.id] = dep;
    });
    return map;
  }, [departments]);

  const filteredAvailabilities = useMemo(() => {
    return availabilities.filter((av) => {
      if (selectedDoctorId !== 'ALL' && Number(av.doctorId) !== Number(selectedDoctorId)) {
        return false;
      }
      if (selectedDay !== 'ALL' && av.dayOfWeek !== selectedDay) {
        return false;
      }
      if (selectedDeptId !== 'ALL') {
        const doc = docMap[av.doctorId];
        if (doc && doc.departmentId && Number(doc.departmentId) !== Number(selectedDeptId)) {
          return false;
        }
      }
      return true;
    });
  }, [availabilities, selectedDoctorId, selectedDay, selectedDeptId, docMap]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Doctor Availability & OPD Roster
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Read-only consultation schedule view for front-desk coordination and patient appointment planning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/staff/reception/appointments/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#007b92] text-white hover:bg-[#00667a] shadow-2xs transition-colors"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Book from Roster</span>
          </Link>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg border border-border transition-colors cursor-pointer"
            title="Refresh Roster"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-muted-foreground font-semibold mb-1">Doctor</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="ALL">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.firstName} {d.lastName} ({d.specialization || 'Consultant'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-muted-foreground font-semibold mb-1">Department</label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-muted-foreground font-semibold mb-1">Day of Week</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="ALL">All Days</option>
              <option value="MONDAY">Monday</option>
              <option value="TUESDAY">Tuesday</option>
              <option value="WEDNESDAY">Wednesday</option>
              <option value="THURSDAY">Thursday</option>
              <option value="FRIDAY">Friday</option>
              <option value="SATURDAY">Saturday</option>
              <option value="SUNDAY">Sunday</option>
            </select>
          </div>
        </div>
      </div>

      {/* Availability Roster Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-[#007b92]" />
            <h2 className="text-sm font-bold text-foreground">
              Doctor Availability Slots ({filteredAvailabilities.length})
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Governance Policy: Read-only Front Desk Access
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#007b92]" />
            <span>Loading doctor availability schedules...</span>
          </div>
        ) : filteredAvailabilities.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No availability slots found for the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Specialty & Dept</th>
                  <th className="py-3 px-4">Day of Week</th>
                  <th className="py-3 px-4">OPD Hours</th>
                  <th className="py-3 px-4">Slot Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAvailabilities.map((av) => {
                  const doc = docMap[av.doctorId];
                  const dept = doc?.departmentId ? deptMap[doc.departmentId] : null;

                  return (
                    <tr
                      key={av.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        {doc ? (
                          <span className="font-semibold text-foreground">
                            Dr. {doc.firstName} {doc.lastName}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Doctor #{av.doctorId}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-muted-foreground">
                          {dept?.name || doc?.specialization || 'OPD Specialist'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                        {av.dayOfWeek}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-foreground whitespace-nowrap">
                        {av.startTime?.slice(0, 5)} - {av.endTime?.slice(0, 5)}
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground whitespace-nowrap">
                        {av.slotDurationMinutes || 15} mins
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                          {av.status || 'AVAILABLE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/staff/reception/appointments/new`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-[#007b92] text-white hover:bg-[#00667a] transition-colors"
                        >
                          Book Slot
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
