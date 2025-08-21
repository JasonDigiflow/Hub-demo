import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// In-memory storage for demo (would use Firebase in production)
let revenuesData = [];

export async function GET() {
  try {
    // Get user from cookie to scope revenues per user
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth_token');
    
    if (!authCookie) {
      return NextResponse.json({ revenues: [], stats: {} }, { status: 200 });
    }

    // Calculate stats
    const totalRevenue = revenuesData.reduce((sum, r) => sum + r.amount, 0);
    const uniqueClients = new Set(revenuesData.map(r => r.clientId)).size;
    const averageTicket = uniqueClients > 0 ? totalRevenue / uniqueClients : 0;
    
    // Calculate monthly growth (mock for demo)
    const currentMonth = new Date().getMonth();
    const currentMonthRevenues = revenuesData.filter(r => {
      const revenueMonth = new Date(r.date).getMonth();
      return revenueMonth === currentMonth;
    });
    const monthlyTotal = currentMonthRevenues.reduce((sum, r) => sum + r.amount, 0);
    
    const stats = {
      totalRevenue,
      totalClients: uniqueClients,
      averageTicket,
      monthlyGrowth: 23.5, // Mock percentage
      monthlyRevenue: monthlyTotal
    };

    return NextResponse.json({ 
      revenues: revenuesData.sort((a, b) => new Date(b.date) - new Date(a.date)),
      stats 
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

    // Add revenue with unique ID
    const newRevenue = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    revenuesData.push(newRevenue);

    return NextResponse.json({ 
      success: true, 
      revenue: newRevenue 
    });
  } catch (error) {
    console.error('Error creating revenue:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}