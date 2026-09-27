/**
 * Centralized API configuration for the public website.
 * All backend endpoints are routed through the API gateway.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const API = {
  BASE: API_BASE,

  // Public Doctor endpoints
  PUBLIC_DOCTORS: `${API_BASE}/api/v1/public/doctors`,
  PUBLIC_SPECIALITIES: `${API_BASE}/api/v1/public/doctors/specialities`,

  // Public Hospital endpoints
  PUBLIC_HOSPITALS: `${API_BASE}/api/v1/public/hospitals`,

  // Appointment endpoints
  APPOINTMENTS: `${API_BASE}/api/v1/appointments`,
} as const;

export type PublicDoctor = {
  id: number;
  doctorId: number;
  firstName: string;
  lastName: string;
  bio: string | null;
  qualifications: string | null;
  specializations: string | null;
  registrationNumber: string | null;
  experienceYears: number | null;
  profilePictureUrl: string | null;
  defaultConsultationFee: number | null;
  status: string;
  updatedAt: string | null;
};

export type PublicHospital = {
  id: number;
  code: string;
  name: string;
  city: string;
  state: string;
  address: string | null;
  phone: string | null;
  emergencyPhone: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type PublicSpeciality = {
  name: string;
  slug: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

/**
 * Fetches public hospitals from the backend.
 */
export async function fetchPublicHospitals(): Promise<PublicHospital[]> {
  try {
    const res = await fetch(API.PUBLIC_HOSPITALS, { cache: 'no-store' });
    if (!res.ok) return [];
    const json: ApiResponse<PublicHospital[]> = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

/**
 * Fetches public doctors, optionally filtered by hospitalId and/or specialization.
 */
export async function fetchPublicDoctors(params?: {
  hospitalId?: number | string;
  specialization?: string;
}): Promise<PublicDoctor[]> {
  try {
    const url = new URL(API.PUBLIC_DOCTORS);
    if (params?.hospitalId) url.searchParams.set('hospitalId', String(params.hospitalId));
    if (params?.specialization) url.searchParams.set('specialization', params.specialization);

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return [];
    const json: ApiResponse<PublicDoctor[]> = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

/**
 * Fetches public specialities, optionally filtered by hospitalId.
 */
export async function fetchPublicSpecialities(hospitalId?: number | string): Promise<PublicSpeciality[]> {
  try {
    const url = new URL(API.PUBLIC_SPECIALITIES);
    if (hospitalId) url.searchParams.set('hospitalId', String(hospitalId));

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return [];
    const json: ApiResponse<PublicSpeciality[]> = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}
