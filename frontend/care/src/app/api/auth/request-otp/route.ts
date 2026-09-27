import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        if (!body.email) {
            return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
        }

        const gatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:8080';
        
        const response = await fetch(`${gatewayUrl}/api/v1/auth/request-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: body.email })
        });

        const data = await response.json();
        
        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Request OTP Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
