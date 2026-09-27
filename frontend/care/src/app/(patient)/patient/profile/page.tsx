import { serverFetch } from '@/lib/server/api-client';
import { getSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import { User } from 'lucide-react';
import { PatientProfileForm } from './PatientProfileForm';

export default async function PatientProfilePage() {
  const session = await getSession();
  if (!session || (!session.roles.includes('PATIENT') && !session.roles.includes('SUPER_ADMIN'))) {
    redirect('/login');
  }

  const res = await serverFetch('/api/v1/patients/me', { next: { revalidate: 0 } });
  const patient = res.ok ? res.data?.data : null;

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <User className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground font-medium">Could not load your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-[#007b92]" />
          My Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage your patient profile and contact information.
        </p>
      </div>

      <PatientProfileForm patient={patient} />
    </div>
  );
}
