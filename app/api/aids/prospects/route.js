import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function GET(request) {
  try {
    const cookieStore = cookies();
    
    // Check for auth token (both with underscore and dash for compatibility)
    let token = cookieStore.get('auth-token') || cookieStore.get('auth_token');
    
    // Also check for Meta session as fallback
    const metaSession = cookieStore.get('meta_session');
    
    // If no auth token but Meta session exists, create a temporary auth context
    if (!token && metaSession) {
      try {
        const session = JSON.parse(metaSession.value);
        if (session.userId) {
          // Use Meta session userId directly
          const userId = session.userId;
          console.log('Using Meta session for auth, userId:', userId);
          
          // Continue with userId from Meta session
          const allProspects = await fetchProspectsForUser(userId);
          
          return NextResponse.json({
            success: true,
            prospects: allProspects,
            count: allProspects.length,
            authMethod: 'meta_session'
          });
        }
      } catch (e) {
        console.error('Error parsing Meta session:', e);
      }
    }
    
    if (!token) {
      console.log('No auth token found, returning empty prospects for demo');
      // Return empty array for demo/unauthenticated mode
      return NextResponse.json({ 
        success: true,
        prospects: [],
        count: 0,
        demo: true
      });
    }

    let userId;
    
    // Handle demo token
    if (token.value === 'demo_token') {
      userId = 'demo_user';
    } else {
      try {
        // Verify JWT token
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'default-secret-key');
        userId = decoded.uid || decoded.userId || decoded.id;
      } catch (error) {
        console.error('JWT verification failed:', error.message);
        // Return empty array instead of 401 to avoid breaking the UI
        return NextResponse.json({ 
          success: true,
          prospects: [],
          count: 0,
          authError: true
        });
      }
    }
    
    const allProspects = await fetchProspectsForUser(userId);
    
    return NextResponse.json({
      success: true,
      prospects: allProspects,
      count: allProspects.length
    });

  } catch (error) {
    console.error('Error fetching prospects:', error);
    
    // Return empty array for any error to avoid breaking the UI
    return NextResponse.json({
      success: true,
      prospects: [],
      count: 0,
      error: error.message
    });
  }
}

async function fetchProspectsForUser(userId) {
  console.log('=== GET PROSPECTS ===');
  console.log('UserId:', userId);
  
  const allProspects = [];
    
    // Method 1: Try to get prospects from the new structure (organizations/adAccounts/prospects)
    try {
      // Get user's organization
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (userData && userData.primaryOrgId) {
        const orgId = userData.primaryOrgId;
        console.log('Found organization:', orgId);
        
        // Get all ad accounts for this org
        const adAccountsSnapshot = await db
          .collection('organizations').doc(orgId)
          .collection('adAccounts')
          .get();
        
        console.log(`Found ${adAccountsSnapshot.size} ad accounts`);
        
        // Get prospects from each ad account
        for (const adAccountDoc of adAccountsSnapshot.docs) {
          const prospectsSnapshot = await db
            .collection('organizations').doc(orgId)
            .collection('adAccounts').doc(adAccountDoc.id)
            .collection('prospects')
            .get();
          
          console.log(`Ad account ${adAccountDoc.id}: ${prospectsSnapshot.size} prospects`);
          
          prospectsSnapshot.forEach(doc => {
            const data = doc.data();
            allProspects.push({
              id: doc.id,
              ...data
            });
          });
        }
      }
    } catch (error) {
      console.log('Error getting prospects from new structure:', error.message);
    }
    
    // Method 2: Also try the old structure (aids_prospects)
    try {
      const oldProspectsRef = db.collection('aids_prospects');
      const oldSnapshot = await oldProspectsRef
        .where('userId', '==', userId)
        .get();
      
      console.log(`Found ${oldSnapshot.size} prospects in old structure`);
      
      oldSnapshot.forEach(doc => {
        const data = doc.data();
        // Avoid duplicates
        if (!allProspects.find(p => p.id === doc.id)) {
          allProspects.push({
            id: doc.id,
            ...data
          });
        }
      });
    } catch (error) {
      console.log('Error getting prospects from old structure:', error.message);
    }
    
    console.log(`Total prospects found: ${allProspects.length}`);
    
    // Log first prospect for debugging
    if (allProspects.length > 0) {
      console.log('First prospect data:', JSON.stringify(allProspects[0], null, 2));
    }
    
    // Sort by date (newest first)
    allProspects.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return dateB - dateA;
    });
    
    return allProspects;
}

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token') || cookieStore.get('auth_token');
    const metaSession = cookieStore.get('meta_session');
    
    let userId;
    
    if (token) {
      try {
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'default-secret-key');
        userId = decoded.uid || decoded.userId || decoded.id;
      } catch (e) {
        console.error('JWT verification failed:', e.message);
      }
    }
    
    // Fallback to meta session
    if (!userId && metaSession) {
      try {
        const session = JSON.parse(metaSession.value);
        userId = session.userID || session.userId;
      } catch (e) {
        console.error('Meta session parse error:', e);
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const data = await request.json();

    // Add user ID and timestamps
    const prospectData = {
      ...data,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedFromMeta: data.syncedFromMeta || false
    };

    // Save to Firebase
    const prospectsRef = db.collection('aids_prospects');
    const docRef = await prospectsRef.add(prospectData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      prospect: {
        id: docRef.id,
        ...prospectData
      }
    });

  } catch (error) {
    console.error('Error creating prospect:', error);
    
    // For demo mode, return success with generated ID
    if (!process.env.FIREBASE_PROJECT_ID) {
      const demoId = `DEMO_${Date.now()}`;
      return NextResponse.json({
        success: true,
        id: demoId,
        demo: true
      });
    }
    
    return NextResponse.json({
      error: 'Erreur lors de la création du prospect',
      details: error.message
    }, { status: 500 });
  }
}

// Bulk import for Meta sync
export async function PUT(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const userId = decoded.uid;
    const { prospects, source, forceSync } = await request.json();

    if (!prospects || !Array.isArray(prospects)) {
      return NextResponse.json({ error: 'Invalid prospects data' }, { status: 400 });
    }

    const prospectsRef = db.collection('aids_prospects');
    const batch = db.batch();
    const importedIds = [];

    // Get existing Meta IDs to avoid duplicates
    const existingSnapshot = await prospectsRef
      .where('userId', '==', userId)
      .where('syncedFromMeta', '==', true)
      .get();
    
    const existingMetaIds = new Set();
    existingSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.metaId) {
        existingMetaIds.add(data.metaId);
      }
    });

    // Process each prospect
    for (const prospect of prospects) {
      // Check if prospect exists (skip if not forcing sync)
      if (!forceSync && prospect.metaId && existingMetaIds.has(prospect.metaId)) {
        // Update existing prospect's status if changed
        const existingProspectQuery = await prospectsRef
          .where('userId', '==', userId)
          .where('metaId', '==', prospect.metaId)
          .limit(1)
          .get();
        
        if (!existingProspectQuery.empty) {
          const existingDoc = existingProspectQuery.docs[0];
          const existingData = existingDoc.data();
          
          // Update if status changed or other important fields
          if (existingData.status !== prospect.status || 
              existingData.email !== prospect.email ||
              existingData.phone !== prospect.phone) {
            await existingDoc.ref.update({
              status: prospect.status || existingData.status,
              email: prospect.email || existingData.email,
              phone: prospect.phone || existingData.phone,
              updatedAt: new Date().toISOString(),
              lastSyncedAt: new Date().toISOString()
            });
            console.log(`Updated prospect ${prospect.metaId} status/info`);
          }
        }
        continue;
      }

      const prospectData = {
        ...prospect,
        userId,
        syncedFromMeta: true,
        source: source || 'Meta',
        createdAt: prospect.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metaId: prospect.id, // Store original Meta ID
        syncedAt: new Date().toISOString()
      };

      const docRef = prospectsRef.doc();
      batch.set(docRef, prospectData);
      importedIds.push(docRef.id);
    }

    // Commit the batch
    if (importedIds.length > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      imported: importedIds.length,
      skipped: prospects.length - importedIds.length,
      existing: existingMetaIds.size,
      total: prospects.length,
      message: `${importedIds.length} nouveaux prospects importés depuis ${source || 'Meta'}`
    });

  } catch (error) {
    console.error('Error bulk importing prospects:', error);
    
    return NextResponse.json({
      error: 'Erreur lors de l\'import des prospects',
      details: error.message
    }, { status: 500 });
  }
}