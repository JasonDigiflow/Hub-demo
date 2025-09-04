import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate demo credentials
    if (email === 'demo@digiflow-agency.fr' && password === 'Demovalou123') {
      // Create demo session cookie
      const response = NextResponse.json({
        success: true,
        user: {
          id: 'demo-user-001',
          email: 'demo@digiflow-agency.fr',
          name: 'Demo User',
          company: 'Demo Company',
          role: 'demo',
          isDemo: true
        }
      });

      // Set demo session cookie
      response.cookies.set('demo_session', JSON.stringify({
        userId: 'demo-user-001',
        email: 'demo@digiflow-agency.fr',
        isDemo: true,
        timestamp: new Date().toISOString()
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600 // 1 hour demo session
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Invalid demo credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}