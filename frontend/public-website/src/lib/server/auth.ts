import { cookies } from 'next/headers';

export type Role = 'SUPER_ADMIN' | 'DOCTOR' | 'PATIENT' | 'RECEPTIONIST' | 'NURSE' | 'LAB_TECHNICIAN' | 'PHARMACIST' | 'BILLING_STAFF';

export interface SessionData {
    sub: string;
    roles: Role[];
    permissions: string[];
    exp: number;
}

export async function getSession(): Promise<SessionData | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('swarnika_session')?.value;

    if (!token) return null;

    try {
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) return null;
        
        // This is strictly for lightweight UI routing/decisions. 
        // THIS IS NON-AUTHORITATIVE. Backend remains the security authority.
        const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
        return JSON.parse(decodedPayload) as SessionData;
    } catch (e) {
        console.error('Failed to parse JWT payload', e);
        return null;
    }
}

export async function hasPermission(permission: string): Promise<boolean> {
    const session = await getSession();
    if (!session) return false;
    return session.permissions?.includes(permission) ?? false;
}
