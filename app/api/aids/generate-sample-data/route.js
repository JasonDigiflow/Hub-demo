import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth-token') || cookieStore.get('auth_token');
    const metaSession = cookieStore.get('meta_session');
    
    // Get userId from session or use default
    let userId = '25219060577684729'; // UserId from the cache
    if (metaSession) {
      try {
        const session = JSON.parse(metaSession.value);
        userId = session.userId || userId;
      } catch (e) {}
    }
    
    console.log(`[Generate Sample Data] Creating sample data for user: ${userId}`);
    
    const prospects = [];
    const revenues = [];
    const now = new Date();
    
    // Generate 10 sample prospects
    const prospectNames = [
      'Jean Dupont', 'Marie Martin', 'Pierre Bernard', 'Sophie Dubois',
      'Thomas Petit', 'Julie Moreau', 'Nicolas Laurent', 'Isabelle Simon',
      'François Michel', 'Céline Garcia'
    ];
    
    const campaignIds = ['120229958084450616', '120229958084470616']; // From cache
    const campaignNames = ['Lead Generation MARSEILLE', 'Summer Campaign'];
    
    for (let i = 0; i < 10; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const prospectDate = new Date(now);
      prospectDate.setDate(prospectDate.getDate() - daysAgo);
      
      const prospect = {
        userId,
        name: prospectNames[i],
        email: `${prospectNames[i].toLowerCase().replace(' ', '.')}@example.com`,
        phone: `+336${Math.floor(10000000 + Math.random() * 90000000)}`,
        campaignId: campaignIds[Math.floor(Math.random() * campaignIds.length)],
        campaignName: campaignNames[Math.floor(Math.random() * campaignNames.length)],
        status: ['new', 'contacted', 'qualified', 'converted'][Math.floor(Math.random() * 4)],
        source: 'meta_ads',
        createdAt: prospectDate,
        updatedAt: prospectDate
      };
      
      try {
        const docRef = await db.collection('prospects').add(prospect);
        prospects.push({ ...prospect, id: docRef.id });
        console.log(`[Generate Sample Data] Created prospect: ${prospect.name}`);
      } catch (error) {
        console.error('[Generate Sample Data] Error creating prospect:', error);
        prospects.push({ ...prospect, id: `mock-prospect-${i}` });
      }
    }
    
    // Generate 5 sample revenues
    const amounts = [150.50, 225.00, 175.75, 320.00, 195.50];
    
    for (let i = 0; i < 5; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const revenueDate = new Date(now);
      revenueDate.setDate(revenueDate.getDate() - daysAgo);
      
      const revenue = {
        userId,
        amount: amounts[i],
        campaignId: campaignIds[Math.floor(Math.random() * campaignIds.length)],
        campaignName: campaignNames[Math.floor(Math.random() * campaignNames.length)],
        source: 'meta_ads',
        currency: 'EUR',
        createdAt: revenueDate,
        updatedAt: revenueDate
      };
      
      try {
        const docRef = await db.collection('revenues').add(revenue);
        revenues.push({ ...revenue, id: docRef.id });
        console.log(`[Generate Sample Data] Created revenue: €${revenue.amount}`);
      } catch (error) {
        console.error('[Generate Sample Data] Error creating revenue:', error);
        revenues.push({ ...revenue, id: `mock-revenue-${i}` });
      }
    }
    
    return NextResponse.json({
      success: true,
      prospects: prospects.length,
      revenues: revenues.length,
      message: `Créé ${prospects.length} prospects et ${revenues.length} revenus`
    });
    
  } catch (error) {
    console.error('[Generate Sample Data] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate sample data',
      details: error.message 
    }, { status: 500 });
  }
}