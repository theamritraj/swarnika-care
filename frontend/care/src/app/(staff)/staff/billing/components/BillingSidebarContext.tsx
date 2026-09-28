'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface BillingSidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  activeHospitalId: number;
  setActiveHospitalId: (id: number) => void;
}

const BillingSidebarContext = createContext<BillingSidebarContextType>({
  isCollapsed: false,
  toggleSidebar: () => {},
  isMobileOpen: false,
  toggleMobileSidebar: () => {},
  closeMobileSidebar: () => {},
  activeHospitalId: 1,
  setActiveHospitalId: () => {},
});

export function BillingSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeHospitalId, setActiveHospitalId] = useState(1);

  useEffect(() => {
    try {
      const savedCollapsed = localStorage.getItem('swarnika_billing_sidebar_collapsed');
      if (savedCollapsed !== null) {
        setIsCollapsed(savedCollapsed === 'true');
      }
      const savedHospital = localStorage.getItem('swarnika_billing_hospital_id');
      if (savedHospital) {
        setActiveHospitalId(Number(savedHospital));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('swarnika_billing_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(prev => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  const handleSetActiveHospitalId = (id: number) => {
    setActiveHospitalId(id);
    try {
      localStorage.setItem('swarnika_billing_hospital_id', String(id));
    } catch {}
  };

  return (
    <BillingSidebarContext.Provider
      value={{
        isCollapsed,
        toggleSidebar,
        isMobileOpen,
        toggleMobileSidebar,
        closeMobileSidebar,
        activeHospitalId,
        setActiveHospitalId: handleSetActiveHospitalId,
      }}
    >
      {children}
    </BillingSidebarContext.Provider>
  );
}

export function useBillingSidebar() {
  return useContext(BillingSidebarContext);
}
