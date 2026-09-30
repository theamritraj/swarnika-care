import React from 'react';
import { getSession } from '@/lib/server/auth';
import { serverFetch } from '@/lib/server/api-client';
import { redirect } from 'next/navigation';
import { PatientSidebarProvider } from './components/PatientSidebarContext';
import { PatientSidebar } from './components/PatientSidebar';
import { PatientHeader } from './components/PatientHeader';

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || (!session.roles.includes('PATIENT') && !session.roles.includes('SUPER_ADMIN'))) {
    redirect('/login');
  }

  let patientInfo = {
    name: 'Patient',
    email: session.sub || '',
    mrn: undefined as string | undefined,
  };

  try {
    const res = await serverFetch('/api/v1/patients/me', {
      next: { revalidate: 0 },
    });

    let p = (res.ok && res.data?.data) ? res.data.data : null;
    if (!p) {
      const sessionEmail = (session as any)?.email;
      if (sessionEmail) {
        const emailRes = await serverFetch(`/api/v1/patients/by-email?email=${encodeURIComponent(sessionEmail)}`, { next: { revalidate: 0 } });
        if (emailRes.ok && emailRes.data?.data) {
          p = emailRes.data.data;
        }
      }
    }

    if (p) {
      patientInfo = {
        name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient',
        email: p.email || session.sub || '',
        mrn: p.mrn,
      };
    }
  } catch (err) {
    console.error('Failed to load patient profile in layout:', err);
  }

  return (
    <PatientSidebarProvider>
      <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
        <PatientSidebar patientInfo={patientInfo} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <PatientHeader patientInfo={patientInfo} />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </PatientSidebarProvider>
  );
}
