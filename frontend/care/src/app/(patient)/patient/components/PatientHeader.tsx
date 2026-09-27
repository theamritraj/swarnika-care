'use client';

import React from 'react';
import Link from 'next/link';
import { usePatientSidebar } from './PatientSidebarContext';
import { Menu, Bell, LogOut, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface PatientHeaderProps {
  patientInfo?: {
    name: string;
    email: string;
    mrn?: string;
  };
}

export function PatientHeader({ patientInfo }: PatientHeaderProps) {
  const { isCollapsed, toggleSidebar, toggleMobileSidebar } = usePatientSidebar();

  const handleToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      toggleMobileSidebar();
    } else {
      toggleSidebar();
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  const patientName = patientInfo?.name || 'Patient';
  const initial = patientName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-card border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left side: Hamburger + Page context */}
      <div className="flex items-center gap-3 flex-1">
        <button
          type="button"
          onClick={handleToggle}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label="Toggle Sidebar"
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">Swarnika Care</span>
          <span className="text-sm font-semibold text-foreground">Patient Portal</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 sm:gap-4 ml-4">
        {/* Notifications */}
        <Link
          href="/patient/notifications"
          className="relative p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full border-2 border-white dark:border-card" />
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />

        <div className="h-8 w-px bg-accent/50 mx-1" />

        {/* Patient Identity Badge */}
        <Link
          href="/patient/profile"
          className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-accent transition-colors"
          title="My Profile"
        >
          <div className="w-8 h-8 rounded-full bg-[#007b92]/10 dark:bg-[#007b92]/20 flex items-center justify-center text-[#007b92] dark:text-[#38bdf8] font-bold text-sm shrink-0">
            {initial}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[150px]">
              {patientName}
            </span>
            {patientInfo?.mrn && (
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider truncate max-w-[150px]">
                MRN: {patientInfo.mrn}
              </span>
            )}
          </div>
        </Link>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 text-muted-foreground hover:text-red-600 transition-colors text-xs font-semibold cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
