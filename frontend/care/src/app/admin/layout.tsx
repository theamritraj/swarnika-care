import React from 'react';
import { AdminSidebarProvider } from './components/AdminSidebarContext';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';

export const metadata = {
  title: 'Admin Portal | Swarnika Care',
  description: 'Swarnika Care Super Admin Portal',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminSidebarProvider>
      <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminSidebarProvider>
  );
}
