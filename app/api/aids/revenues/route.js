import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Get user from cookie to scope revenues per user
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

    // Get revenues directly from Firebase Admin
    const revenues = [];
    
    try {
      const revenuesRef = db.collection('aids_revenues');
      const snapshot = await revenuesRef.get();
      
      snapshot.forEach(doc => {
        revenues.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort by date
      revenues.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      
    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);
      // Continue with empty array
    }
    
    // Calculate stats
    const totalRevenue = revenues.reduce((sum, r) => sum + (r.amount || 0), 0);
    const uniqueClients = new Set(revenues.map(r => r.clientId)).size;
    const averageTicket = uniqueClients > 0 ? totalRevenue / uniqueClients : 0;
    
    const stats = {
      totalRevenue,
      totalClients: uniqueClients,
      averageTicket,
      monthlyGrowth: 0, // Simplified for now
      revenueCount: revenues.length
    };

    return NextResponse.json({ 
      revenues,
      stats,
      success: true
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

    // Create revenue using Firebase Admin directly
    const revenueRef = await db.collection('aids_revenues').add({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    const revenueId = revenueRef.id;
    
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
      prospectUpdated: !!data.prospectId
    });
  } catch (error) {
    console.error('Error creating revenue:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}