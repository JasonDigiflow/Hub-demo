import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revenueService } from '@/lib/aids/revenueService';

export async function GET() {
  try {
    // Get user from cookie to scope revenues per user
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth_token');
    
    if (!authCookie) {
      return NextResponse.json({ revenues: [], stats: {} }, { status: 200 });
    }

    // Get revenues and stats from service (uses Firebase if available)
    const revenues = await revenueService.getAll();
    const stats = await revenueService.getStats();

    return NextResponse.json({ 
      revenues,
      stats,
      usingFirebase: revenueService.isFirebaseAvailable()
    });
  } catch (error) {
    console.error('Error fetching revenues:', error);
    return NextResponse.json({ 
      revenues: [], 
      stats: {
        totalRevenue: 0,
        totalClients: 0,
        averageTicket: 0,
        monthlyGrowth: 0
      },
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.clientId || !data.clientName || !data.amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create revenue using service (will use Firebase if available)
    const revenueId = await revenueService.create(data);

    return NextResponse.json({ 
      success: true, 
      id: revenueId,
      usingFirebase: revenueService.isFirebaseAvailable()
    });
  } catch (error) {
    console.error('Error creating revenue:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}