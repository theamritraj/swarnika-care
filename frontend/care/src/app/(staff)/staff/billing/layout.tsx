import React from 'react';
import { getSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import { BillingSidebarProvider } from './components/BillingSidebarContext';
import { BillingSidebar } from './components/BillingSidebar';
import { BillingHeader } from './components/BillingHeader';

export default async function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (
    !session ||
    (!session.roles.includes('BILLING_STAFF') &&
      !session.roles.includes('SUPER_ADMIN') &&
      !session.roles.includes('HOSPITAL_ADMIN'))
  ) {
    redirect('/login');
  }

  const staffInfo = {
    name: session.sub || 'Billing Staff',
    email: session.sub?.includes('@') ? session.sub : 'billing@swarnika.com',
    hospital: 'Swarnika City Hospital',
  };

  return (
    <BillingSidebarProvider>
      <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
        <BillingSidebar staffInfo={staffInfo} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <BillingHeader staffInfo={staffInfo} />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </BillingSidebarProvider>
  );
}
