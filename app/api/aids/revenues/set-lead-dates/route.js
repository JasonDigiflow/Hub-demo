import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const { updates } = await request.json();
    
    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ 
        error: 'Updates array is required' 
      }, { status: 400 });
    }
    
    console.log(`[Set Lead Dates] Processing ${updates.length} updates...`);
    
    let updatedCount = 0;
    
    for (const update of updates) {
      const { revenueId, leadDate } = update;
      
      if (!revenueId || !leadDate) {
        console.log(`[Set Lead Dates] Skipping invalid update:`, update);
        continue;
      }
      
      try {
        await db.collection('aids_revenues').doc(revenueId).update({
          leadDate: leadDate,
          updatedAt: new Date().toISOString()
        });
        
        updatedCount++;
        console.log(`[Set Lead Dates] Updated revenue ${revenueId} with lead date ${leadDate}`);
      } catch (error) {
        console.error(`[Set Lead Dates] Error updating revenue ${revenueId}:`, error);
      }
    }
    
    return NextResponse.json({
      success: true,
      updatedCount,
      total: updates.length,
      message: `Mis à jour ${updatedCount} revenues sur ${updates.length}`
    });
    
  } catch (error) {
    console.error('[Set Lead Dates] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to set lead dates',
      details: error.message 
    }, { status: 500 });
  }
}

// Set default lead dates based on assumptions
export async function PUT(request) {
  try {
    console.log('[Set Lead Dates] Setting default lead dates...');
    
    // Get all revenues without leadDate
    const revenuesQuery = await db.collection('aids_revenues').get();
    
    const updates = [];
    
    revenuesQuery.forEach(doc => {
      const data = doc.data();
      
      if (!data.leadDate) {
        // Assume lead came 30 days before closing (default TTD)
        const closingDate = new Date(data.date || data.createdAt);
        const assumedLeadDate = new Date(closingDate);
        assumedLeadDate.setDate(assumedLeadDate.getDate() - 30); // 30 days before closing
        
        updates.push({
          revenueId: doc.id,
          leadDate: assumedLeadDate.toISOString()
        });
      }
    });
    
    console.log(`[Set Lead Dates] Found ${updates.length} revenues needing lead dates`);
    
    // Apply updates
    let updatedCount = 0;
    for (const update of updates) {
      try {
        await db.collection('aids_revenues').doc(update.revenueId).update({
          leadDate: update.leadDate,
          leadDateAssumed: true, // Mark as assumed
          updatedAt: new Date().toISOString()
        });
        updatedCount++;
      } catch (error) {
        console.error(`[Set Lead Dates] Error updating ${update.revenueId}:`, error);
      }
    }
    
    return NextResponse.json({
      success: true,
      updatedCount,
      total: updates.length,
      message: `Défini ${updatedCount} lead dates par défaut (30j avant closing)`
    });
    
  } catch (error) {
    console.error('[Set Lead Dates] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to set default lead dates',
      details: error.message 
    }, { status: 500 });
  }
}