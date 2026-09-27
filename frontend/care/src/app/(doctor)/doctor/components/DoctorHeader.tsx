'use client';

import React from 'react';
import Link from 'next/link';
import { useDoctorSidebar } from './DoctorSidebarContext';
import { Menu, Bell, Search, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface DoctorHeaderProps {
  doctorInfo?: {
    name: string;
    email: string;
    specialty?: string;
    hospital?: string;
  };
}

export function DoctorHeader({ doctorInfo }: DoctorHeaderProps) {
  const { isCollapsed, toggleSidebar, toggleMobileSidebar } = useDoctorSidebar();

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

  const doctorName = doctorInfo?.name || 'Dr. Practitioner';
  const initial = doctorName.replace(/^Dr\.\s*/i, '').charAt(0) || 'D';
  const specialty = doctorInfo?.specialty || 'Consultant';

  return (
    <header className="h-16 bg-card border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left side: Hamburger button + Global Clinical Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={handleToggle}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label="Toggle Sidebar"
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
          <input
            type="text"
            placeholder="Search patients, UHID, encounters..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] focus:bg-card transition-all placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* Right side: Clean Enterprise Actions */}
      <div className="flex items-center gap-3 sm:gap-4 ml-4">
        {/* Notifications */}
        <Link
          href="/doctor/notifications"
          className="relative p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full border-2 border-white dark:border-card" />
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />

        <div className="h-8 w-px bg-accent/50 mx-1"></div>

        {/* Doctor Identity Profile Badge */}
        <Link
          href="/doctor/profile"
          className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-accent transition-colors"
          title="Doctor Profile"
        >
          <div className="w-8 h-8 rounded-full bg-[#007b92]/10 dark:bg-[#007b92]/20 flex items-center justify-center text-[#007b92] dark:text-[#38bdf8] font-bold text-sm shrink-0">
            {initial}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[150px]">
              {doctorName}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider truncate max-w-[150px]">
              {specialty}
            </span>
          </div>
        </Link>

        {/* Logout Button */}
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
