import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const userId = decoded.uid;

    // Get user's prospects from Firebase
    const prospectsRef = db.collection('aids_prospects');
    const snapshot = await prospectsRef
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const prospects = [];
    snapshot.forEach(doc => {
      prospects.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return NextResponse.json({
      success: true,
      prospects,
      count: prospects.length
    });

  } catch (error) {
    console.error('Error fetching prospects:', error);
    
    // Return empty array for demo mode
    if (error.code === 'INVALID_ARGUMENT' || error.code === 7) {
      return NextResponse.json({
        success: true,
        prospects: [],
        count: 0,
        demo: true
      });
    }
    
    return NextResponse.json({
      error: 'Erreur lors de la récupération des prospects',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const userId = decoded.uid;
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
    const { prospects, source } = await request.json();

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
      // Skip if already exists (based on Meta ID)
      if (prospect.metaId && existingMetaIds.has(prospect.metaId)) {
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