import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function forwardRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = '/' + path.join('/');
  const searchParams = request.nextUrl.search;
  
  const gatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:8080';
  const url = `${gatewayUrl}${targetPath}${searchParams}`;

  const cookieStore = await cookies();
  const token = cookieStore.get('swarnika_session')?.value;

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const method = request.method;
  let body: string | undefined = undefined;

  if (method !== 'GET' && method !== 'HEAD') {
    try {
      const json = await request.json();
      body = JSON.stringify(json);
    } catch {
      // Body may be empty
    }
  }

  try {
    const backendRes = await fetch(url, {
      method,
      headers,
      body,
      cache: 'no-store'
    });

    const data = await backendRes.json().catch(() => null);
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error(`BFF Proxy error for ${method} ${url}:`, error);
    return NextResponse.json(
      { success: false, message: 'Backend service unreachable via API Gateway' },
      { status: 502 }
    );
  }
}

export const GET = forwardRequest;
export const POST = forwardRequest;
export const PUT = forwardRequest;
export const PATCH = forwardRequest;
export const DELETE = forwardRequest;
