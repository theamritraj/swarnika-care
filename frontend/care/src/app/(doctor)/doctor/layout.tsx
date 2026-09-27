import React from 'react';
import { getSession } from '@/lib/server/auth';
import { serverFetch } from '@/lib/server/api-client';
import { redirect } from 'next/navigation';
import { DoctorSidebarProvider } from './components/DoctorSidebarContext';
import { DoctorSidebar } from './components/DoctorSidebar';
import { DoctorHeader } from './components/DoctorHeader';

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || (!session.roles.includes('DOCTOR') && !session.roles.includes('SUPER_ADMIN'))) {
    redirect('/login');
  }

  let doctorInfo = {
    name: 'Dr. Practitioner',
    email: '',
    specialty: 'Consultant',
    hospital: 'Swarnika City Hospital',
  };

  try {
    const res = await serverFetch('/api/v1/doctors/me', {
      next: { revalidate: 0 },
    });

    if (res.ok && res.data?.data) {
      const doc = res.data.data;
      doctorInfo = {
        name: `Dr. ${doc.firstName || ''} ${doc.lastName || ''}`.trim() || 'Dr. Practitioner',
        email: doc.email || '',
        specialty: doc.specialization || 'Consultant',
        hospital: 'Swarnika City Hospital',
      };
    }
  } catch (err) {
    console.error('Failed to load doctor profile in layout:', err);
  }

  return (
    <DoctorSidebarProvider>
      <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
        <DoctorSidebar doctorInfo={doctorInfo} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <DoctorHeader doctorInfo={doctorInfo} />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DoctorSidebarProvider>
  );
}
