import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        if (!body.email || !body.otp) {
            return NextResponse.json({ success: false, message: 'Email and OTP are required' }, { status: 400 });
        }

        const gatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:8080';
        
        const response = await fetch(`${gatewayUrl}/api/v1/auth/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: body.email, otp: body.otp })
        });

        const data = await response.json();
        
        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        const token = data.data?.token;

        if (!token) {
            return NextResponse.json({ success: false, message: 'Invalid response from server' }, { status: 500 });
        }

        // Set HttpOnly Cookie
        const cookieStore = await cookies();
        cookieStore.set('swarnika_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        let decodedRoles = [];
        try {
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = atob(payloadBase64);
            const session = JSON.parse(decodedPayload);
            decodedRoles = session.roles || [];
        } catch (e) {
            console.error('Failed to decode roles from token');
        }

        // Strip token from response to browser
        const safeData = {
            success: data.success,
            message: data.message,
            data: {
                user: {
                    roles: decodedRoles
                }
            }
        };

        return NextResponse.json(safeData);
    } catch (error) {
        console.error('Verify OTP Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
