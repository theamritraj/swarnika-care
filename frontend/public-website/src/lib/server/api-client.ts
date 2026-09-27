import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function serverFetch(endpoint: string, options: RequestInit = {}) {
    const cookieStore = await cookies();
    const token = cookieStore.get('swarnika_session')?.value;
    const gatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:8080';

    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    try {
        const response = await fetch(`${gatewayUrl}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            // Delete cookie or let middleware handle it
            // Ideally we throw an error or redirect
            redirect('/login');
        }

        if (response.status === 403) {
            redirect('/403');
        }

        const data = await response.json().catch(() => null);

        return {
            status: response.status,
            ok: response.ok,
            data
        };
    } catch (error) {
        console.error('API Client Error:', error);
        throw error;
    }
}
