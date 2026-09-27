'use client';
import { Bell, Search, Menu, PanelLeftClose, PanelLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAdminSidebar } from './AdminSidebarContext';

export default function AdminHeader() {
  const { isCollapsed, toggleCollapse, toggleMobile } = useAdminSidebar();

  const handleToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      toggleMobile();
    } else {
      toggleCollapse();
    }
  };

  return (
    <header className="h-16 bg-card border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={handleToggle}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label="Toggle Sidebar"
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
          <input 
            type="text" 
            placeholder="Search across admin portal..." 
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] focus:bg-card transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-4">
        <button 
          type="button"
          aria-label="Notifications"
          className="relative p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-card"></span>
        </button>
        
        <ThemeToggle />
        
        <div className="h-8 w-px bg-accent/50 mx-2"></div>
        
        <button 
          type="button"
          className="flex items-center gap-2 hover:bg-background p-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-[#e6f8f1] dark:bg-[#007b92]/20 flex items-center justify-center text-[#007b92] dark:text-[#38bdf8] font-bold">
            A
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-semibold text-foreground leading-none">Admin</span>
            <span className="text-[10px] text-muted-foreground uppercase">Super Admin</span>
          </div>
        </button>
      </div>
    </header>
  );
}
