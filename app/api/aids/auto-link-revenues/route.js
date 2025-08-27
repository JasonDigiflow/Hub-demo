import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    console.log('[Auto Link] Starting automatic revenue-prospect linking...');
    
    // Get all revenues without leadDate
    const revenuesQuery = await db.collection('aids_revenues').get();
    
    let linkedCount = 0;
    let totalRevenues = 0;
    const updates = [];
    
    // Get all prospects for matching
    const prospectsMap = new Map();
    
    // Load aids_prospects
    const aidsProspectsQuery = await db.collection('aids_prospects').get();
    aidsProspectsQuery.forEach(doc => {
      const data = doc.data();
      // Index by name and email for matching
      if (data.name) {
        prospectsMap.set(data.name.toLowerCase(), {
          id: doc.id,
          ...data,
          source: 'aids_prospects'
        });
      }
      if (data.email) {
        prospectsMap.set(data.email.toLowerCase(), {
          id: doc.id,
          ...data,
          source: 'aids_prospects'
        });
      }
    });
    
    console.log(`[Auto Link] Loaded ${prospectsMap.size} prospect entries for matching`);
    
    // Process each revenue
    for (const revenueDoc of revenuesQuery.docs) {
      const revenue = revenueDoc.data();
      totalRevenues++;
      
      // Skip if already has leadDate
      if (revenue.leadDate) {
        console.log(`[Auto Link] Revenue ${revenueDoc.id} already has leadDate, skipping`);
        continue;
      }
      
      let matchedProspect = null;
      let leadDate = null;
      
      // Try to find matching prospect
      // 1. By prospectId if exists
      if (revenue.prospectId) {
        // Direct ID match
        const prospectDoc = await db.collection('aids_prospects').doc(revenue.prospectId).get();
        if (prospectDoc.exists) {
          matchedProspect = prospectDoc.data();
          leadDate = matchedProspect.createdAt || matchedProspect.date;
          console.log(`[Auto Link] Matched by prospectId: ${revenue.prospectId}`);
        }
      }
      
      // 2. By client name
      if (!matchedProspect && revenue.clientName) {
        const nameKey = revenue.clientName.toLowerCase();
        if (prospectsMap.has(nameKey)) {
          matchedProspect = prospectsMap.get(nameKey);
          leadDate = matchedProspect.createdAt || matchedProspect.date;
          console.log(`[Auto Link] Matched by name: ${revenue.clientName}`);
        }
      }
      
      // 3. By email if stored
      if (!matchedProspect && revenue.email) {
        const emailKey = revenue.email.toLowerCase();
        if (prospectsMap.has(emailKey)) {
          matchedProspect = prospectsMap.get(emailKey);
          leadDate = matchedProspect.createdAt || matchedProspect.date;
          console.log(`[Auto Link] Matched by email: ${revenue.email}`);
        }
      }
      
      // If we found a match, update the revenue
      if (matchedProspect && leadDate) {
        const updateData = {
          leadDate: leadDate,
          prospectId: matchedProspect.id,
          prospectName: matchedProspect.name,
          updatedAt: new Date().toISOString()
        };
        
        await db.collection('aids_revenues').doc(revenueDoc.id).update(updateData);
        linkedCount++;
        
        // Calculate TTD
        const leadDateObj = new Date(leadDate);
        const closingDateObj = new Date(revenue.date || revenue.createdAt);
        const ttdDays = Math.floor((closingDateObj - leadDateObj) / (1000 * 60 * 60 * 24));
        
        console.log(`[Auto Link] Linked revenue ${revenueDoc.id} to prospect ${matchedProspect.id}`);
        console.log(`[Auto Link] Lead date: ${leadDate}, TTD: ${ttdDays} days`);
        
        updates.push({
          revenueId: revenueDoc.id,
          prospectId: matchedProspect.id,
          leadDate,
          ttd: ttdDays
        });
      } else {
        console.log(`[Auto Link] No match found for revenue ${revenueDoc.id} (${revenue.clientName})`);
      }
    }
    
    console.log(`[Auto Link] Process complete: ${linkedCount}/${totalRevenues} revenues linked`);
    
    return NextResponse.json({
      success: true,
      totalRevenues,
      linkedCount,
      updates,
      message: `Lié ${linkedCount} revenues sur ${totalRevenues} avec leurs prospects`
    });
    
  } catch (error) {
    console.error('[Auto Link] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to auto-link revenues',
      details: error.message 
    }, { status: 500 });
  }
}

// GET endpoint to check link status
export async function GET() {
  try {
    const revenuesQuery = await db.collection('aids_revenues').get();
    
    let withLeadDate = 0;
    let withoutLeadDate = 0;
    let ttdSum = 0;
    let ttdCount = 0;
    
    revenuesQuery.forEach(doc => {
      const data = doc.data();
      if (data.leadDate) {
        withLeadDate++;
        
        // Calculate TTD
        const leadDate = new Date(data.leadDate);
        const closingDate = new Date(data.date || data.createdAt);
        const ttdDays = Math.floor((closingDate - leadDate) / (1000 * 60 * 60 * 24));
        
        if (ttdDays >= 0 && ttdDays < 365) {
          ttdSum += ttdDays;
          ttdCount++;
        }
      } else {
        withoutLeadDate++;
      }
    });
    
    const averageTTD = ttdCount > 0 ? Math.round(ttdSum / ttdCount) : 0;
    
    return NextResponse.json({
      success: true,
      totalRevenues: revenuesQuery.size,
      withLeadDate,
      withoutLeadDate,
      averageTTD,
      ttdCount,
      percentLinked: revenuesQuery.size > 0 ? 
        ((withLeadDate / revenuesQuery.size) * 100).toFixed(1) : 0
    });
    
  } catch (error) {
    console.error('[Auto Link] Error checking status:', error);
    return NextResponse.json({ 
      error: 'Failed to check link status',
      details: error.message 
    }, { status: 500 });
  }
}