'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useReceptionSidebar } from './ReceptionSidebarContext';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  CalendarPlus,
  UserCheck,
  Clock,
  CalendarClock,
  AlertTriangle,
  Bell,
  LogOut,
  X,
  Building2
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'FRONT DESK',
    items: [
      { title: 'Dashboard', href: '/staff/reception/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'PATIENT DESK',
    items: [
      { title: 'Patient Directory', href: '/staff/reception/patients', icon: Users },
      { title: 'Register Patient', href: '/staff/reception/patients/new', icon: UserPlus },
    ],
  },
  {
    label: 'APPOINTMENTS',
    items: [
      { title: "Today's Schedule", href: '/staff/reception/appointments', icon: Calendar },
      { title: 'Book Appointment', href: '/staff/reception/appointments/new', icon: CalendarPlus },
      { title: 'Walk-in Intake', href: '/staff/reception/walk-in', icon: UserCheck },
    ],
  },
  {
    label: 'QUEUE & ROSTER',
    items: [
      { title: 'Live OPD Queue', href: '/staff/reception/queue', icon: Clock },
      { title: 'Doctor Availability', href: '/staff/reception/availability', icon: CalendarClock },
    ],
  },
  {
    label: 'INPATIENT & TRANSFERS',
    items: [
      { title: 'Admissions Desk', href: '/staff/reception/admissions', icon: Building2 },
      { title: 'Referral Desk', href: '/staff/reception/referrals', icon: UserCheck },
    ],
  },
  {
    label: 'EMERGENCY',
    items: [
      { title: 'Emergency Intake', href: '/staff/reception/emergency', icon: AlertTriangle },
    ],
  },
  {
    label: 'SYSTEM & AUDIT',
    items: [
      { title: 'Operational Audit', href: '/staff/reception/audit-logs', icon: LayoutDashboard },
      { title: 'Notifications', href: '/staff/reception/notifications', icon: Bell },
    ],
  },
];

export function ReceptionSidebar({
  staffInfo,
}: {
  staffInfo?: { name: string; email: string; hospital?: string };
}) {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, closeMobileSidebar } = useReceptionSidebar();

  useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`bg-card border-r border-border h-screen flex flex-col sticky top-0 z-50 shrink-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${
          isMobileOpen
            ? 'fixed inset-y-0 left-0 w-64 shadow-2xl flex translate-x-0'
            : 'fixed inset-y-0 left-0 -translate-x-full md:translate-x-0 md:flex hidden'
        }`}
      >
        {/* Header with Logo */}
        <div
          className={`p-4 border-b border-border/50 shrink-0 flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {isCollapsed ? (
            <Link href="/staff/reception/dashboard" title="Swarnika Front Desk">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007b92] to-[#005a6b] flex items-center justify-center text-white font-black text-xl shadow-xs">
                S
              </div>
            </Link>
          ) : (
            <div className="flex items-center justify-between w-full">
              <Link href="/staff/reception/dashboard" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Swarnika Hospital"
                  width={145}
                  height={38}
                  className="object-contain dark:brightness-0 dark:invert"
                  priority
                />
              </Link>
              <button
                type="button"
                onClick={closeMobileSidebar}
                aria-label="Close sidebar"
                className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Role badge */}
        {!isCollapsed && (
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-border/40 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#007b92] truncate">
                Front Desk Operations
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {staffInfo?.hospital || 'Swarnika Care'}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
          {navSections.map((section, idx) => (
            <div key={idx}>
              {!isCollapsed && (
                <div className="px-3 mb-1.5 text-[10px] font-bold text-muted-foreground/80 tracking-wider uppercase">
                  {section.label}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/staff/reception/dashboard' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.title : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group ${
                        isActive
                          ? 'bg-[#007b92] text-white font-semibold shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                      } ${isCollapsed ? 'justify-center px-2' : ''}`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.title}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info & Logout */}
        <div className="p-3 border-t border-border shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/60 text-[#007b92] flex items-center justify-center font-bold text-xs shrink-0">
                FD
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">
                  {staffInfo?.name || 'Front Desk'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {staffInfo?.email || 'reception@swarnika.com'}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? 'Sign out' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
