import { verifySession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Get token from Authorization header or query parameter
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  req.nextUrl.searchParams.get('token') ||
                  (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 401 }
      );
    }

    const user = await verifySession(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json({ user, valid: true });
  } catch (error) {
    console.error('[v0] Verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred during verification' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const user = await verifySession(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json({ user, valid: true });
  } catch (error) {
    console.error('[v0] Verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred during verification' },
      { status: 500 }
    );
  }
}
