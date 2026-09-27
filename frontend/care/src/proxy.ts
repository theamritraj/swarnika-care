import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define protected prefixes
    const protectedPrefixes = ['/patient', '/doctor', '/staff', '/admin'];
    const isProtected = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

    if (isProtected) {
        const sessionCookie = request.cookies.get('swarnika_session');
        if (!sessionCookie) {
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }

        try {
            const token = sessionCookie.value;
            const payloadBase64 = token.split('.')[1];
            if (!payloadBase64) {
                return NextResponse.redirect(new URL('/login', request.url));
            }
            const decodedPayload = atob(payloadBase64);
            const session = JSON.parse(decodedPayload);
            const roles: string[] = session.roles || [];

            if (pathname.startsWith('/admin') && !roles.includes('SUPER_ADMIN')) {
                return NextResponse.redirect(new URL('/403', request.url));
            }

            if (pathname.startsWith('/doctor') && !roles.includes('DOCTOR') && !roles.includes('SUPER_ADMIN')) {
                return NextResponse.redirect(new URL('/403', request.url));
            }

            if (pathname.startsWith('/patient') && !roles.includes('PATIENT') && !roles.includes('SUPER_ADMIN')) {
                return NextResponse.redirect(new URL('/403', request.url));
            }

            const staffRoles = ['NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'PHARMACIST', 'BILLING_STAFF', 'SUPER_ADMIN'];
            if (pathname.startsWith('/staff') && !roles.some(r => staffRoles.includes(r))) {
                return NextResponse.redirect(new URL('/403', request.url));
            }
        } catch {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
