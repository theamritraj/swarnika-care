'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { usePatientSidebar } from './PatientSidebarContext';
import {
  LayoutDashboard,
  Calendar,
  Stethoscope,
  Pill,
  FlaskConical,
  User,
  Bell,
  Search,
  X,
  LogOut,
  Hash,
  Building2,
  Bed,
  ArrowRightLeft,
  FileText,
  Receipt,
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
      { title: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'MY APPOINTMENTS',
    items: [
      { title: 'Appointments', href: '/patient/appointments', icon: Calendar },
      { title: 'Find Doctors', href: '/patient/doctors', icon: Search },
      { title: 'Check-in & Queue', href: '/patient/queue', icon: Hash },
    ],
  },
  {
    label: 'CLINICAL HISTORY',
    items: [
      { title: 'Medical Records', href: '/patient/records', icon: Stethoscope },
      { title: 'Prescriptions', href: '/patient/prescriptions', icon: Pill },
      { title: 'Lab & Imaging', href: '/patient/orders', icon: FlaskConical },
    ],
  },
  {
    label: 'HOSPITAL',
    items: [
      { title: 'Registrations', href: '/patient/registrations', icon: Building2 },
      { title: 'Admissions / IPD', href: '/patient/admissions', icon: Bed },
      { title: 'Referrals', href: '/patient/referrals', icon: ArrowRightLeft },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { title: 'Documents', href: '/patient/documents', icon: FileText },
      { title: 'Billing & Payments', href: '/patient/billing', icon: Receipt },
      { title: 'Notifications', href: '/patient/notifications', icon: Bell },
      { title: 'My Profile', href: '/patient/profile', icon: User },
    ],
  },
];

export function PatientSidebar({
  patientInfo,
}: {
  patientInfo?: { name: string; email: string; mrn?: string };
}) {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, closeMobileSidebar } = usePatientSidebar();

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

  const initial = (patientInfo?.name || 'P').charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`bg-card border-r border-border h-screen flex flex-col sticky top-0 z-50 shrink-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${
          isMobileOpen
            ? 'fixed inset-y-0 left-0 w-64 shadow-2xl flex translate-x-0'
            : 'fixed inset-y-0 left-0 -translate-x-full md:translate-x-0 md:flex hidden'
        }`}
      >
        {/* Sidebar Header */}
        <div
          className={`p-4 border-b border-border/50 shrink-0 flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {isCollapsed ? (
            <Link href="/patient/dashboard" title="Swarnika Hospitals Patient Portal">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007b92] to-[#005a6b] flex items-center justify-center text-white font-black text-xl shadow-xs">
                S
              </div>
            </Link>
          ) : (
            <div>
              <Link href="/patient/dashboard" className="flex items-center">
                <Image
                  src="https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712540/swarnikacare/website/logo.png"
                  alt="Swarnika Hospital"
                  width={155}
                  height={42}
                  className="object-contain dark:brightness-0 dark:invert"
                  priority
                />
              </Link>
              <p className="text-[10px] text-muted-foreground font-bold tracking-widest mt-1.5 pl-0.5">
                PATIENT PORTAL
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={closeMobileSidebar}
            className="md:hidden p-1.5 text-muted-foreground hover:bg-accent rounded-lg"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
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
              {section.items.map(item => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/patient/dashboard' && pathname.startsWith(item.href));
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

        {/* Patient Identity & Logout footer */}
        <div className="border-t border-border/50 p-3 shrink-0">
          {!isCollapsed && (
            <div className="mb-2 rounded-lg bg-accent/40 p-2.5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#007b92]/15 flex items-center justify-center text-[#007b92] font-bold text-xs shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {patientInfo?.name || 'Patient'}
                </p>
                {patientInfo?.mrn && (
                  <p className="text-[10px] text-muted-foreground truncate">
                    MRN: {patientInfo.mrn}
                  </p>
                )}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors w-full ${
              isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
            }`}
            title="Sign out of Patient Portal"
          >
            <LogOut className={`${isCollapsed ? 'w-5 h-5 shrink-0' : 'w-4 h-4 shrink-0'}`} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
