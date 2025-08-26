import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';
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

    // Get user authentication
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth-token') || cookieStore.get('auth_token');
    const metaSession = cookieStore.get('meta_session');
    
    let userId = null;
    
    if (authCookie) {
      try {
        const decoded = jwt.verify(authCookie.value, process.env.JWT_SECRET || 'default-secret-key');
        userId = decoded.uid || decoded.userId || decoded.id;
      } catch (e) {
        console.error('JWT verification failed:', e.message);
      }
    }
    
    if (!userId && metaSession) {
      try {
        const session = JSON.parse(metaSession.value);
        userId = session.userID || session.userId;
      } catch (e) {
        console.error('Meta session parse error:', e);
      }
    }

    // Create revenue using service (will use Firebase if available)
    const revenueId = await revenueService.create(data);
    
    // Update prospect status to 'converted' with revenue amount
    if (userId && data.prospectId) {
      try {
        console.log('Updating prospect status for:', data.prospectId);
        
        // Get user's organization
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        if (userData && userData.primaryOrgId) {
          const orgId = userData.primaryOrgId;
          
          // Find the prospect in the organization's ad accounts
          const adAccountsSnapshot = await db
            .collection('organizations').doc(orgId)
            .collection('adAccounts')
            .get();
          
          for (const adAccountDoc of adAccountsSnapshot.docs) {
            const prospectRef = db
              .collection('organizations').doc(orgId)
              .collection('adAccounts').doc(adAccountDoc.id)
              .collection('prospects').doc(data.prospectId);
            
            const prospectDoc = await prospectRef.get();
            
            if (prospectDoc.exists) {
              // Update prospect status and add revenue info
              await prospectRef.update({
                status: 'converted',
                revenueAmount: data.amount,
                revenueDate: data.date || new Date().toISOString(),
                revenueService: data.service || '',
                updatedAt: new Date().toISOString(),
                convertedAt: new Date().toISOString()
              });
              
              console.log(`Prospect ${data.prospectId} updated to converted with revenue ${data.amount}`);
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error updating prospect status:', error);
        // Don't fail the revenue creation if prospect update fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      id: revenueId,
      prospectUpdated: !!data.prospectId,
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