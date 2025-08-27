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
    
    const prospect = {
      userId,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      campaignId: data.campaignId || null,
      campaignName: data.campaignName || null,
      status: data.status || 'new',
      source: 'manual',
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await db.collection('prospects').add(prospect);
    
    console.log(`[Add Prospect] Created prospect ${docRef.id}: ${prospect.name}`);
    
    return NextResponse.json({
      success: true,
      id: docRef.id,
      prospect
    });
    
  } catch (error) {
    console.error('[Add Prospect] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to add prospect',
      details: error.message 
    }, { status: 500 });
  }
}