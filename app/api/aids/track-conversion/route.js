import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const data = await request.json();
    const { prospectId, amount, notes } = data;
    
    if (!prospectId || !amount) {
      return NextResponse.json({ 
        error: 'Prospect ID and amount are required'
      }, { status: 400 });
    }
    
    const cookieStore = await cookies();
    const metaSession = cookieStore.get('meta_session');
    
    if (!metaSession) {
      return NextResponse.json({ 
        error: 'Not authenticated'
      }, { status: 401 });
    }
    
    const session = JSON.parse(metaSession.value);
    const userId = session.userId;
    
    console.log(`[Track Conversion] Converting prospect ${prospectId} to revenue €${amount}`);
    
    // Get the prospect details
    const prospectDoc = await db.collection('prospects').doc(prospectId).get();
    
    if (!prospectDoc.exists) {
      return NextResponse.json({ 
        error: 'Prospect not found'
      }, { status: 404 });
    }
    
    const prospect = prospectDoc.data();
    
    // Create revenue record
    const revenue = {
      userId,
      prospectId,
      prospectName: prospect.name,
      amount: parseFloat(amount),
      campaignId: prospect.campaignId,
      campaignName: prospect.campaignName,
      adId: prospect.adId,
      adName: prospect.adName,
      source: 'meta_ads_conversion',
      currency: 'EUR',
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save revenue
    const revenueRef = await db.collection('revenues').add(revenue);
    
    // Update prospect status to converted
    await db.collection('prospects').doc(prospectId).update({
      status: 'converted',
      conversionDate: new Date(),
      revenueId: revenueRef.id,
      revenueAmount: parseFloat(amount),
      updatedAt: new Date()
    });
    
    console.log(`[Track Conversion] Created revenue ${revenueRef.id} from prospect ${prospectId}`);
    
    return NextResponse.json({
      success: true,
      revenueId: revenueRef.id,
      prospectId,
      amount: parseFloat(amount),
      message: `Conversion trackée : ${prospect.name} → €${amount}`
    });
    
  } catch (error) {
    console.error('[Track Conversion] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to track conversion',
      details: error.message 
    }, { status: 500 });
  }
}

// GET endpoint to get conversion stats
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const metaSession = cookieStore.get('meta_session');
    
    if (!metaSession) {
      return NextResponse.json({ 
        error: 'Not authenticated'
      }, { status: 401 });
    }
    
    const session = JSON.parse(metaSession.value);
    const userId = session.userId;
    
    // Get all prospects
    const prospectsQuery = await db.collection('prospects')
      .where('userId', '==', userId)
      .get();
    
    let totalProspects = 0;
    let convertedProspects = 0;
    
    prospectsQuery.forEach(doc => {
      totalProspects++;
      const data = doc.data();
      if (data.status === 'converted') {
        convertedProspects++;
      }
    });
    
    // Get all revenues from conversions
    const revenuesQuery = await db.collection('revenues')
      .where('userId', '==', userId)
      .where('source', '==', 'meta_ads_conversion')
      .get();
    
    let totalRevenue = 0;
    let revenueCount = 0;
    
    revenuesQuery.forEach(doc => {
      const data = doc.data();
      totalRevenue += data.amount || 0;
      revenueCount++;
    });
    
    const conversionRate = totalProspects > 0 
      ? ((convertedProspects / totalProspects) * 100).toFixed(2)
      : 0;
    
    const averageRevenue = revenueCount > 0
      ? (totalRevenue / revenueCount).toFixed(2)
      : 0;
    
    return NextResponse.json({
      success: true,
      stats: {
        totalProspects,
        convertedProspects,
        conversionRate: parseFloat(conversionRate),
        totalRevenue: totalRevenue.toFixed(2),
        revenueCount,
        averageRevenue: parseFloat(averageRevenue)
      }
    });
    
  } catch (error) {
    console.error('[Track Conversion] Error getting stats:', error);
    return NextResponse.json({ 
      error: 'Failed to get conversion stats',
      details: error.message 
    }, { status: 500 });
  }
}