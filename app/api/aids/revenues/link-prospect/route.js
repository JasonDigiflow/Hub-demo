import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const { revenueId, prospectId } = await request.json();
    
    if (!revenueId || !prospectId) {
      return NextResponse.json({ 
        error: 'Revenue ID and Prospect ID are required' 
      }, { status: 400 });
    }
    
    console.log(`[Link Prospect] Linking prospect ${prospectId} to revenue ${revenueId}`);
    
    // Get prospect details to extract lead date
    let leadDate = null;
    let prospectName = null;
    
    // Try aids_prospects collection first
    try {
      const prospectDoc = await db.collection('aids_prospects').doc(prospectId).get();
      if (prospectDoc.exists) {
        const prospectData = prospectDoc.data();
        // Use createdAt as lead date (when they entered our funnel)
        leadDate = prospectData.createdAt || prospectData.date;
        prospectName = prospectData.name;
        console.log(`[Link Prospect] Found prospect in aids_prospects: ${prospectName}, Lead date: ${leadDate}`);
      }
    } catch (error) {
      console.log('[Link Prospect] Prospect not found in aids_prospects');
    }
    
    // Try prospects collection (from Meta sync)
    if (!leadDate) {
      try {
        const prospectDoc = await db.collection('prospects').doc(prospectId).get();
        if (prospectDoc.exists) {
          const prospectData = prospectDoc.data();
          // Use createdAt which comes from Meta's lead.created_time
          leadDate = prospectData.createdAt || prospectData.syncedAt;
          prospectName = prospectData.name || prospectData.prospectName;
          console.log(`[Link Prospect] Found prospect in prospects: ${prospectName}, Lead date: ${leadDate}`);
        }
      } catch (error) {
        console.log('[Link Prospect] Prospect not found in prospects collection');
      }
    }
    
    // Update revenue with prospect info and lead date
    const updateData = {
      prospectId,
      leadDate: leadDate || null,
      prospectName: prospectName || null,
      updatedAt: new Date().toISOString()
    };
    
    // Update in aids_revenues
    await db.collection('aids_revenues').doc(revenueId).update(updateData);
    
    console.log(`[Link Prospect] Successfully linked prospect ${prospectId} to revenue ${revenueId}`);
    console.log(`[Link Prospect] Lead date: ${leadDate}`);
    
    return NextResponse.json({
      success: true,
      revenueId,
      prospectId,
      leadDate,
      prospectName,
      message: `Prospect ${prospectName || prospectId} lié à la revenue`
    });
    
  } catch (error) {
    console.error('[Link Prospect] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to link prospect to revenue',
      details: error.message 
    }, { status: 500 });
  }
}

// GET endpoint to get linkable prospects for a revenue
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const revenueId = searchParams.get('revenueId');
    
    const cookieStore = await cookies();
    const metaSession = cookieStore.get('meta_session');
    
    let userId = null;
    if (metaSession) {
      try {
        const session = JSON.parse(metaSession.value);
        userId = session.userId;
      } catch (e) {}
    }
    
    // Get all prospects that haven't been converted yet
    const prospects = [];
    
    // Get from aids_prospects
    const aidsProspectsQuery = await db.collection('aids_prospects')
      .where('status', '!=', 'converted')
      .get();
    
    aidsProspectsQuery.forEach(doc => {
      const data = doc.data();
      prospects.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        createdAt: data.createdAt,
        source: 'manual'
      });
    });
    
    // Get from prospects (Meta sync)
    if (userId) {
      const prospectsQuery = await db.collection('prospects')
        .where('userId', '==', userId)
        .where('status', '!=', 'converted')
        .get();
      
      prospectsQuery.forEach(doc => {
        const data = doc.data();
        prospects.push({
          id: doc.id,
          name: data.name || data.prospectName,
          email: data.email,
          phone: data.phone,
          createdAt: data.createdAt,
          source: 'meta'
        });
      });
    }
    
    // Sort by date (newest first)
    prospects.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
    
    return NextResponse.json({
      success: true,
      prospects,
      count: prospects.length
    });
    
  } catch (error) {
    console.error('[Link Prospect] Error getting prospects:', error);
    return NextResponse.json({ 
      error: 'Failed to get prospects',
      details: error.message 
    }, { status: 500 });
  }
}