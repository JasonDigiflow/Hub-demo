import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Get userId
    const cookieStore = await cookies();
    const metaSession = cookieStore.get('meta_session');
    let userId = '25219060577684729'; // Default from cache
    
    if (metaSession) {
      try {
        const session = JSON.parse(metaSession.value);
        userId = session.userId || userId;
      } catch (e) {}
    }
    
    const revenue = {
      userId,
      amount: parseFloat(data.amount),
      campaignId: data.campaignId || null,
      campaignName: data.campaignName || null,
      source: data.source || 'manual',
      currency: 'EUR',
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await db.collection('revenues').add(revenue);
    
    console.log(`[Add Revenue] Created revenue ${docRef.id}: €${revenue.amount}`);
    
    return NextResponse.json({
      success: true,
      id: docRef.id,
      revenue
    });
    
  } catch (error) {
    console.error('[Add Revenue] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to add revenue',
      details: error.message 
    }, { status: 500 });
  }
}