'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Hospital, Network, Layers, 
  Users, Stethoscope, IdCard, HeartPulse, 
  CalendarCheck, CalendarClock, ShieldCheck, KeyRound, 
  Receipt, FileText, History, Settings, HelpCircle, LogOut,
  X
} from 'lucide-react';
import { useAdminSidebar } from './AdminSidebarContext';

const mainNavItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
];

const orgNavItems = [
  { href: '/admin/hospitals', icon: Hospital, label: 'Hospitals' },
  { href: '/admin/departments', icon: Network, label: 'Departments' },
  { href: '/admin/infrastructure', icon: Layers, label: 'Infrastructure' },
];

const peopleNavItems = [
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
  { href: '/admin/staff', icon: IdCard, label: 'Staff' },
  { href: '/admin/patients', icon: HeartPulse, label: 'Patients' },
];

const opsNavItems = [
  { href: '/admin/appointments', icon: CalendarCheck, label: 'Appointments' },
  { href: '/admin/availability', icon: CalendarClock, label: 'Availability' },
];

const accessNavItems = [
  { href: '/admin/roles', icon: ShieldCheck, label: 'Roles' },
  { href: '/admin/permissions', icon: KeyRound, label: 'Permissions' },
];

const billingNavItems = [
  { href: '/admin/billing', icon: Receipt, label: 'Billing Config' },
];

const reportsNavItems = [
  { href: '/admin/reports', icon: FileText, label: 'Reports' },
];

const systemNavItems = [
  { href: '/admin/audit-logs', icon: History, label: 'Audit Logs' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, closeMobile } = useAdminSidebar();

  // Automatically close mobile sidebar on navigation
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  const renderLinks = (items: any[]) => {
    return items.map((item) => {
      const isActive = item.href === '/admin' 
        ? pathname === '/admin' 
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
      
      return (
        <Link 
          key={item.href} 
          href={item.href}
          title={isCollapsed ? item.label : undefined}
          className={`flex items-center rounded-lg transition-colors text-sm font-medium ${
            isCollapsed 
              ? 'justify-center p-2.5 mx-auto' 
              : 'gap-3 px-3 py-2'
          } ${
            isActive 
              ? 'bg-[#007b92] text-white shadow-xs' 
              : 'text-muted-foreground hover:bg-accent hover:text-card-foreground'
          }`}
        >
          <item.icon className={`${isCollapsed ? 'w-5 h-5 shrink-0' : 'w-4 h-4 shrink-0'}`} />
          {!isCollapsed && <span className="truncate">{item.label}</span>}
        </Link>
      );
    });
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity"
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
        {/* Sidebar Header */}
        <div className={`p-4 border-b border-border/50 shrink-0 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {isCollapsed ? (
            <Link href="/admin" title="Swarnika Hospitals Admin">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007b92] to-[#005a6b] flex items-center justify-center text-white font-black text-xl shadow-xs">
                S
              </div>
            </Link>
          ) : (
            <div>
              <Link href="/admin" className="flex items-center">
                <Image 
                  src="https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712540/swarnikacare/website/logo.png" 
                  alt="Swarnika Hospital" 
                  width={155} 
                  height={42} 
                  className="object-contain dark:brightness-0 dark:invert" 
                  priority 
                />
              </Link>
              <p className="text-[10px] text-muted-foreground font-bold tracking-widest mt-1.5 pl-0.5">SUPER ADMIN</p>
            </div>
          )}

          {/* Mobile Close Button */}
          <button 
            type="button"
            onClick={closeMobile}
            className="md:hidden p-1.5 text-muted-foreground hover:bg-accent rounded-lg"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-3 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-1">
            {renderLinks(mainNavItems)}
          </div>

          <div>
            {!isCollapsed ? (
              <h3 className="px-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">Organization</h3>
            ) : (
              <div className="h-px bg-border/40 mx-2 my-2" />
            )}
            <div className="flex flex-col gap-1">{renderLinks(orgNavItems)}</div>
          </div>

          <div>
            {!isCollapsed ? (
              <h3 className="px-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">People</h3>
            ) : (
              <div className="h-px bg-border/40 mx-2 my-2" />
            )}
            <div className="flex flex-col gap-1">{renderLinks(peopleNavItems)}</div>
          </div>

          <div>
            {!isCollapsed ? (
              <h3 className="px-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">Operations</h3>
            ) : (
              <div className="h-px bg-border/40 mx-2 my-2" />
            )}
            <div className="flex flex-col gap-1">{renderLinks(opsNavItems)}</div>
          </div>

          <div>
            {!isCollapsed ? (
              <h3 className="px-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">System & Settings</h3>
            ) : (
              <div className="h-px bg-border/40 mx-2 my-2" />
            )}
            <div className="flex flex-col gap-1">
              {renderLinks(accessNavItems)}
              {renderLinks(reportsNavItems)}
              {renderLinks(systemNavItems)}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-3 border-t border-border/50 flex flex-col gap-1 shrink-0 ${isCollapsed ? 'items-center' : ''}`}>
          <Link 
            href="/admin/help" 
            title={isCollapsed ? "Help & Support" : undefined}
            className={`flex items-center rounded-lg transition-colors text-sm font-medium text-muted-foreground hover:bg-accent ${
              isCollapsed ? 'justify-center p-2.5 w-10 h-10' : 'gap-3 px-3 py-2 w-full'
            }`}
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Help & Support</span>}
          </Link>
          
          <button 
            type="button"
            title={isCollapsed ? "Logout" : undefined}
            className={`flex items-center rounded-lg transition-colors text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer ${
              isCollapsed ? 'justify-center p-2.5 w-10 h-10' : 'gap-3 px-3 py-2 w-full text-left'
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
