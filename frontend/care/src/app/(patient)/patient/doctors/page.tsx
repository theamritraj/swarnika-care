import { serverFetch } from '@/lib/server/api-client';
import { getSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import { Stethoscope } from 'lucide-react';
import { DoctorsList } from './DoctorsList';

export default async function FindDoctorsPage() {
  const session = await getSession();
  if (!session || (!session.roles.includes('PATIENT') && !session.roles.includes('SUPER_ADMIN'))) {
    redirect('/login');
  }

  // Get patient ID
  const profileRes = await serverFetch('/api/v1/patients/me', { next: { revalidate: 60 } });
  const patient = profileRes.ok ? profileRes.data?.data : null;

  // Get published doctors
  const doctorsRes = await serverFetch('/api/v1/public/doctors', { next: { revalidate: 60 } });
  const doctors = doctorsRes.ok && Array.isArray(doctorsRes.data?.data) ? doctorsRes.data.data : [];

  // Get specialities
  const specRes = await serverFetch('/api/v1/public/doctors/specialities', { next: { revalidate: 300 } });
  const specialities: string[] = specRes.ok && Array.isArray(specRes.data?.data)
    ? specRes.data.data.map((s: any) => s.specialization || s).filter(Boolean)
    : [...new Set(doctors.map((d: any) => d.specialization).filter(Boolean))];

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-[#007b92]" />
          Find & Book a Doctor
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse our specialist doctors and book an appointment.
        </p>
      </div>

      {!patient ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 text-sm text-amber-700 dark:text-amber-400">
          Could not load your patient profile. Please ensure your account is fully set up.
        </div>
      ) : (
        <DoctorsList
          doctors={doctors}
          specialities={specialities}
          patientId={patient.id}
        />
      )}
    </div>
  );
}
