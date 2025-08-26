import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';
import inMemoryStore from '@/lib/aids/inMemoryStore';

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

    // Get revenues - try Firebase first, fallback to in-memory
    let revenues = [];
    const isFirebaseReady = db && db.isInitialized && db.isInitialized();
    
    if (isFirebaseReady) {
      try {
        const revenuesRef = db.collection('aids_revenues');
        const snapshot = await revenuesRef.get();
        
        console.log(`Firebase: Found ${snapshot.size} documents`);
        
        snapshot.forEach(doc => {
          const docData = doc.data();
          revenues.push({
            id: doc.id,
            ...docData
          });
        });
        
      } catch (firebaseError) {
        console.error('Firebase error, using in-memory store:', firebaseError.message);
        revenues = await inMemoryStore.getAllRevenues();
      }
    } else {
      console.log('Firebase not initialized, using in-memory store');
      revenues = await inMemoryStore.getAllRevenues();
    }
    
    // Sort by date
    revenues.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    console.log(`Returning ${revenues.length} revenues`);
    
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

    // Create revenue - try Firebase first, fallback to in-memory
    let revenueId;
    const revenueData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const isFirebaseReady = db && db.isInitialized && db.isInitialized();
    
    if (isFirebaseReady) {
      try {
        const revenueRef = db.collection('aids_revenues').doc();
        console.log('Creating revenue in Firebase with ID:', revenueRef.id);
        await revenueRef.set(revenueData);
        revenueId = revenueRef.id;
        console.log('Revenue created in Firebase with ID:', revenueId);
      } catch (error) {
        console.error('Firebase error, using in-memory store:', error.message);
        revenueId = await inMemoryStore.addRevenue(revenueData);
        console.log('Revenue created in memory with ID:', revenueId);
      }
    } else {
      console.log('Firebase not initialized, using in-memory store');
      revenueId = await inMemoryStore.addRevenue(revenueData);
      console.log('Revenue created in memory with ID:', revenueId);
    }
    
    // Update prospect status to 'converted' with revenue amount
    if (userId && data.prospectId) {
      try {
        console.log('Updating prospect status for:', data.prospectId);
        
        // Get user's organization - use userId as fallback
        let orgId = userId;
        
        try {
          const userDoc = await db.collection('users').doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            orgId = userData.primaryOrgId || userId;
            console.log(`Using orgId: ${orgId} for user: ${userId}`);
          }
        } catch (error) {
          console.log('Could not fetch user data, using userId as orgId');
        }
        
        // Find the prospect in the organization's ad accounts
        let prospectUpdated = false;
        
        try {
          const adAccountsSnapshot = await db
            .collection('organizations').doc(orgId)
            .collection('adAccounts')
            .get();
          
          console.log(`Found ${adAccountsSnapshot.size} ad accounts for org ${orgId}`);
          console.log(`Searching for prospect ID: ${data.prospectId}`);
          
          for (const adAccountDoc of adAccountsSnapshot.docs) {
            console.log(`Checking ad account: ${adAccountDoc.id}`);
            
            // Essayer d'abord avec l'ID direct (pour les nouveaux prospects avec ID Meta)
            let prospectRef = db
              .collection('organizations').doc(orgId)
              .collection('adAccounts').doc(adAccountDoc.id)
              .collection('prospects').doc(data.prospectId);
            
            let prospectDoc = await prospectRef.get();
            
            // Si pas trouvé et que l'ID commence par LEAD_, chercher par metaId dans les données
            if (!prospectDoc.exists && data.prospectId.startsWith('LEAD_')) {
              console.log(`Searching for prospect with metaId: ${data.prospectId} in ${adAccountDoc.id}`);
              const prospectsSnapshot = await db
                .collection('organizations').doc(orgId)
                .collection('adAccounts').doc(adAccountDoc.id)
                .collection('prospects')
                .where('metaId', '==', data.prospectId)
                .limit(1)
                .get();
              
              if (!prospectsSnapshot.empty) {
                prospectDoc = prospectsSnapshot.docs[0];
                prospectRef = prospectDoc.ref;
                console.log(`Found prospect with Firebase ID: ${prospectDoc.id} and metaId: ${data.prospectId}`);
              }
            }
            
            // Si toujours pas trouvé, chercher par id dans les données
            if (!prospectDoc.exists) {
              console.log(`Searching for prospect with id field: ${data.prospectId} in ${adAccountDoc.id}`);
              const prospectsSnapshot = await db
                .collection('organizations').doc(orgId)
                .collection('adAccounts').doc(adAccountDoc.id)
                .collection('prospects')
                .where('id', '==', data.prospectId)
                .limit(1)
                .get();
              
              if (!prospectsSnapshot.empty) {
                prospectDoc = prospectsSnapshot.docs[0];
                prospectRef = prospectDoc.ref;
                console.log(`Found prospect with Firebase ID: ${prospectDoc.id} and id field: ${data.prospectId}`);
              }
            }
            
            console.log(`Prospect exists in ${adAccountDoc.id}: ${prospectDoc.exists}`);
            
            if (prospectDoc.exists) {
              // Update prospect status and add revenue info
              const updateData = {
                status: 'converted',
                revenueAmount: data.amount,
                revenueDate: data.date || new Date().toISOString(),
                revenueService: data.service || '',
                updatedAt: new Date().toISOString(),
                convertedAt: new Date().toISOString()
              };
              
              console.log(`Updating prospect with data:`, updateData);
              await prospectRef.update(updateData);
              
              console.log(`✅ Prospect ${data.prospectId} updated to converted with revenue ${data.amount} in ad account ${adAccountDoc.id}`);
              prospectUpdated = true;
              break;
            }
          }
        } catch (error) {
          console.error('Error searching in ad accounts:', error);
        }
        
        // If not found in any ad account, try creating it in default location
        if (!prospectUpdated) {
          console.log(`Prospect ${data.prospectId} not found in ad accounts, creating in default location`);
          
          const defaultAdAccountId = 'default';
          const prospectRef = db
            .collection('organizations').doc(orgId)
            .collection('adAccounts').doc(defaultAdAccountId)
            .collection('prospects').doc(data.prospectId);
          
          // Create or update the prospect
          await prospectRef.set({
            id: data.prospectId,
            name: data.clientName || 'Client sans nom',
            company: data.clientName || 'Client sans nom',
            status: 'converted',
            revenueAmount: data.amount,
            revenueDate: data.date || new Date().toISOString(),
            convertedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            source: 'Revenue'
          }, { merge: true });
          
          console.log(`Created/Updated prospect ${data.prospectId} in default location`);
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