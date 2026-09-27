'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useReceptionSidebar } from './ReceptionSidebarContext';
import {
  Menu,
  Building2,
  Search,
  UserPlus,
  UserCheck,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface Hospital {
  id: number;
  name: string;
  code?: string;
  city?: string;
}

export function ReceptionHeader({
  staffInfo,
}: {
  staffInfo?: { name: string; email: string; hospital?: string };
}) {
  const { isCollapsed, toggleSidebar, toggleMobileSidebar, activeHospitalId, setActiveHospitalId } = useReceptionSidebar();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadHospitals() {
      try {
        const res = await fetch('/api/proxy/api/v1/hospitals');
        if (res.ok) {
          const data = await res.json();
          const list = data.data || [];
          setHospitals(list);
          if (list.length > 0 && !activeHospitalId) {
            setActiveHospitalId(list[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to load hospitals in header:', e);
      }
    }
    loadHospitals();
  }, [activeHospitalId, setActiveHospitalId]);

  const handleToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      toggleMobileSidebar();
    } else {
      toggleSidebar();
    }
  };

  const currentHospital = hospitals.find(h => h.id === activeHospitalId) || hospitals[0];

  return (
    <header className="h-16 bg-card border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Sidebar toggle + Hospital Scope */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggle}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label="Toggle Sidebar"
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Hospital Branch Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background shadow-2xs">
          <Building2 className="w-4 h-4 text-[#007b92] shrink-0" />
          <select
            value={activeHospitalId}
            onChange={(e) => setActiveHospitalId(Number(e.target.value))}
            className="text-xs font-semibold bg-transparent border-none text-foreground focus:outline-hidden cursor-pointer"
          >
            {hospitals.length > 0 ? (
              hospitals.map((h) => (
                <option key={h.id} value={h.id} className="bg-card text-foreground">
                  {h.name} {h.city ? `(${h.city})` : ''}
                </option>
              ))
            ) : (
              <option value="1">Swarnika Main Hospital</option>
            )}
          </select>
        </div>
      </div>

      {/* Center: Search to Quick Find Patient */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
        <form
          action="/staff/reception/patients"
          method="GET"
          className="relative w-full"
        >
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
          <input
            type="text"
            name="q"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient by Name, MRN, Phone..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-border/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
          />
        </form>
      </div>

      {/* Right: Quick Action Buttons & Theme/User */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/staff/reception/walk-in"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Walk-in</span>
        </Link>

        <Link
          href="/staff/reception/patients/new"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#007b92] text-white hover:bg-[#00667a] shadow-2xs transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New Patient</span>
        </Link>

        <Link
          href="/staff/reception/emergency"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 hover:bg-red-100 transition-colors"
          title="Emergency Fast-Track Intake"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Emergency</span>
        </Link>

        <div className="h-5 w-px bg-border mx-1" />

        <ThemeToggle />

        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-[#007b92] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            {staffInfo?.name?.charAt(0) || 'R'}
          </div>
        </div>
      </div>
    </header>
  );
}
