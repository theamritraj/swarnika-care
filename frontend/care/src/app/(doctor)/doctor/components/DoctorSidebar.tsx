'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useDoctorSidebar } from './DoctorSidebarContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCheck,
  Stethoscope,
  Pill,
  FlaskConical,
  Clock,
  CalendarClock,
  Bell,
  User,
  LogOut,
  X
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
    label: 'OVERVIEW',
    items: [
      { title: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'CLINICAL WORKSPACE',
    items: [
      { title: "Today's Queue", href: '/doctor/queue', icon: Users },
      { title: 'Appointments', href: '/doctor/appointments', icon: Calendar },
      { title: 'My Patients', href: '/doctor/patients', icon: UserCheck },
      { title: 'Encounters', href: '/doctor/encounters', icon: Stethoscope },
    ],
  },
  {
    label: 'CONSULTATION & ORDERS',
    items: [
      { title: 'Prescriptions', href: '/doctor/prescriptions', icon: Pill },
      { title: 'Lab & Imaging Orders', href: '/doctor/orders', icon: FlaskConical },
    ],
  },
  {
    label: 'RECORDS & SCHEDULE',
    items: [
      { title: 'Visit History', href: '/doctor/history', icon: Clock },
      { title: 'My Availability', href: '/doctor/schedule', icon: CalendarClock },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { title: 'Notifications', href: '/doctor/notifications', icon: Bell },
      { title: 'My Profile', href: '/doctor/profile', icon: User },
    ],
  },
];

export function DoctorSidebar({
  doctorInfo,
}: {
  doctorInfo?: { name: string; email: string; specialty?: string; hospital?: string };
}) {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, closeMobileSidebar } = useDoctorSidebar();

  // Close mobile sidebar on route change
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
          // Desktop Width
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${
          // Mobile responsive slide-over drawer
          isMobileOpen
            ? 'fixed inset-y-0 left-0 w-64 shadow-2xl flex translate-x-0'
            : 'fixed inset-y-0 left-0 -translate-x-full md:translate-x-0 md:flex hidden'
        }`}
      >
        {/* Sidebar Header with Swarnika Logo */}
        <div
          className={`p-4 border-b border-border/50 shrink-0 flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {isCollapsed ? (
            <Link href="/doctor/dashboard" title="Swarnika Hospitals Doctor Portal">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007b92] to-[#005a6b] flex items-center justify-center text-white font-black text-xl shadow-xs">
                S
              </div>
            </Link>
          ) : (
            <div>
              <Link href="/doctor/dashboard" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Swarnika Hospital"
                  width={155}
                  height={42}
                  className="object-contain dark:brightness-0 dark:invert"
                  priority
                />
              </Link>
              <p className="text-[10px] text-muted-foreground font-bold tracking-widest mt-1.5 pl-0.5">
                DOCTOR PORTAL
              </p>
            </div>
          )}

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="md:hidden p-1.5 text-muted-foreground hover:bg-accent rounded-lg"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-3 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
          {navSections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              {!isCollapsed ? (
                <h3 className="px-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
                  {section.label}
                </h3>
              ) : (
                <div className="h-px bg-border/40 mx-2 my-1" />
              )}
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/doctor/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.title : undefined}
                    className={`flex items-center rounded-lg transition-colors text-sm font-medium ${
                      isCollapsed ? 'justify-center p-2.5 mx-auto' : 'gap-3 px-3 py-2'
                    } ${
                      isActive
                        ? 'bg-[#007b92] text-white shadow-xs'
                        : 'text-muted-foreground hover:bg-accent hover:text-card-foreground'
                    }`}
                  >
                    <Icon className={`${isCollapsed ? 'w-5 h-5 shrink-0' : 'w-4 h-4 shrink-0'}`} />
                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Doctor Identity & Logout footer */}
        <div className="border-t border-border/50 p-3 shrink-0">
          {!isCollapsed && (
            <div className="mb-2 rounded-lg bg-accent/40 p-2.5">
              <p className="text-xs font-semibold text-foreground truncate">
                {doctorInfo?.name || 'Dr. Practitioner'}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {doctorInfo?.specialty || 'General Medicine'}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors w-full ${
              isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
            }`}
            title="Sign out of Doctor Portal"
          >
            <LogOut className={`${isCollapsed ? 'w-5 h-5 shrink-0' : 'w-4 h-4 shrink-0'}`} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
