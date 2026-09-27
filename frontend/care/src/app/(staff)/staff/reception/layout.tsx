import React from 'react';
import { getSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import { ReceptionSidebarProvider } from './components/ReceptionSidebarContext';
import { ReceptionSidebar } from './components/ReceptionSidebar';
import { ReceptionHeader } from './components/ReceptionHeader';

export default async function ReceptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (
    !session ||
    (!session.roles.includes('RECEPTIONIST') &&
      !session.roles.includes('SUPER_ADMIN') &&
      !session.roles.includes('HOSPITAL_ADMIN'))
  ) {
    redirect('/login');
  }

  const staffInfo = {
    name: session.sub || 'Front Desk Staff',
    email: session.sub?.includes('@') ? session.sub : 'reception@swarnika.com',
    hospital: 'Swarnika City Hospital',
  };

  return (
    <ReceptionSidebarProvider>
      <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
        <ReceptionSidebar staffInfo={staffInfo} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <ReceptionHeader staffInfo={staffInfo} />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ReceptionSidebarProvider>
  );
}
