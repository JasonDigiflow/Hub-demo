import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function POST() {
  const rebuildLog = {
    deleted: 0,
    created: 0,
    errors: []
  };

  try {
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
    
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    console.log('=== REBUILD REVENUES STARTED ===');
    console.log('User ID:', userId);
    
    // 1. First, get ALL revenues (including those with bad IDs)
    const snapshot = await db.collection('aids_revenues').get();
    console.log(`Found ${snapshot.size} revenues in Firebase`);
    
    const allRevenues = [];
    
    // Collect all revenue data
    snapshot.forEach(doc => {
      const data = doc.data();
      allRevenues.push({
        oldId: doc.id,
        ...data
      });
    });
    
    // 2. Delete ALL existing revenues
    console.log('Deleting all existing revenues...');
    const batch1 = db.batch();
    let deleteCount = 0;
    
    snapshot.forEach(doc => {
      batch1.delete(doc.ref);
      deleteCount++;
      rebuildLog.deleted++;
      
      if (deleteCount >= 500) {
        // This shouldn't happen but just in case
        throw new Error('Too many documents to delete in one batch');
      }
    });
    
    if (deleteCount > 0) {
      await batch1.commit();
      console.log(`Deleted ${deleteCount} revenues`);
    }
    
    // 3. Remove duplicates from collected data
    const uniqueRevenues = new Map();
    
    allRevenues.forEach(revenue => {
      // Create unique key
      const key = `${revenue.clientName}_${revenue.amount}_${revenue.date}_${revenue.prospectId || 'none'}`;
      
      // If duplicate, keep the most recent one
      if (uniqueRevenues.has(key)) {
        const existing = uniqueRevenues.get(key);
        const existingDate = new Date(existing.updatedAt || existing.createdAt || 0);
        const currentDate = new Date(revenue.updatedAt || revenue.createdAt || 0);
        
        if (currentDate > existingDate) {
          uniqueRevenues.set(key, revenue);
        }
      } else {
        uniqueRevenues.set(key, revenue);
      }
    });
    
    console.log(`After deduplication: ${uniqueRevenues.size} unique revenues`);
    
    // 4. Recreate all revenues with proper Firebase IDs
    const batch2 = db.batch();
    let createCount = 0;
    
    for (const [key, revenue] of uniqueRevenues) {
      try {
        // Remove the oldId field and any problematic fields
        const { oldId, id, ...cleanData } = revenue;
        
        // Create new document with auto-generated Firebase ID
        const newDocRef = db.collection('aids_revenues').doc();
        
        batch2.set(newDocRef, {
          ...cleanData,
          userId: userId, // Ensure userId is set
          createdAt: cleanData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rebuiltAt: new Date().toISOString(),
          originalId: oldId || id || 'unknown'
        });
        
        createCount++;
        rebuildLog.created++;
        
        console.log(`Creating new revenue: ${newDocRef.id} (was: ${oldId || id})`);
        
        // Commit every 400 documents (Firebase limit is 500)
        if (createCount >= 400) {
          await batch2.commit();
          console.log(`Created batch of ${createCount} revenues`);
          createCount = 0;
        }
      } catch (error) {
        console.error('Error creating revenue:', error);
        rebuildLog.errors.push(error.message);
      }
    }
    
    // Commit remaining documents
    if (createCount > 0) {
      await batch2.commit();
      console.log(`Created final batch of ${createCount} revenues`);
    }
    
    console.log('=== REBUILD COMPLETED ===');
    console.log('Rebuild log:', rebuildLog);
    
    return NextResponse.json({
      success: true,
      rebuildLog,
      message: `✅ Reconstruction terminée: ${rebuildLog.deleted} supprimés, ${rebuildLog.created} recréés avec de nouveaux IDs`
    });
    
  } catch (error) {
    console.error('Fatal error in rebuild:', error);
    return NextResponse.json({
      error: error.message,
      rebuildLog
    }, { status: 500 });
  }
}