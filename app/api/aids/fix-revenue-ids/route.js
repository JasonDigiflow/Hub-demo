import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function POST() {
  const fixLog = {
    checked: 0,
    fixed: 0,
    deleted: 0,
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
    
    console.log('=== FIX REVENUE IDS STARTED ===');
    console.log('User ID:', userId);
    
    // Get all revenues
    const snapshot = await db.collection('aids_revenues').get();
    console.log(`Found ${snapshot.size} revenues in Firebase`);
    
    // Group revenues by their data to find duplicates
    const revenuesByKey = new Map();
    const toDelete = [];
    const toMigrate = [];
    
    snapshot.forEach(doc => {
      fixLog.checked++;
      const data = doc.data();
      const currentId = doc.id;
      
      // Create a unique key based on client and date
      const key = `${data.clientName}_${data.amount}_${data.date}_${data.prospectId}`;
      
      if (revenuesByKey.has(key)) {
        // Duplicate found
        const existing = revenuesByKey.get(key);
        console.log(`Found duplicate: ${currentId} is duplicate of ${existing.id}`);
        
        // Keep the one with proper Firebase ID (not timestamp) or the newer one
        const currentIsTimestamp = /^\d{13}$/.test(currentId);
        const existingIsTimestamp = /^\d{13}$/.test(existing.id);
        
        if (currentIsTimestamp && !existingIsTimestamp) {
          // Keep existing, delete current
          toDelete.push(doc);
        } else if (!currentIsTimestamp && existingIsTimestamp) {
          // Keep current, delete existing
          toDelete.push(existing.doc);
          revenuesByKey.set(key, { id: currentId, doc: doc });
        } else {
          // Both are same type, keep the newer one
          const currentDate = new Date(data.updatedAt || data.createdAt);
          const existingDate = new Date(existing.data.updatedAt || existing.data.createdAt);
          
          if (currentDate > existingDate) {
            toDelete.push(existing.doc);
            revenuesByKey.set(key, { id: currentId, doc: doc, data: data });
          } else {
            toDelete.push(doc);
          }
        }
      } else {
        revenuesByKey.set(key, { id: currentId, doc: doc, data: data });
      }
      
      // Check if ID needs migration (is a timestamp)
      if (/^\d{13}$/.test(currentId)) {
        toMigrate.push(doc);
      }
    });
    
    // Delete duplicates
    console.log(`Found ${toDelete.length} duplicates to delete`);
    for (const doc of toDelete) {
      try {
        await doc.ref.delete();
        fixLog.deleted++;
        console.log(`Deleted duplicate: ${doc.id}`);
      } catch (error) {
        console.error(`Error deleting ${doc.id}:`, error);
        fixLog.errors.push(`Delete ${doc.id}: ${error.message}`);
      }
    }
    
    // Migrate timestamp IDs to proper Firebase IDs
    console.log(`Found ${toMigrate.length} revenues with timestamp IDs to migrate`);
    const batch = db.batch();
    let batchCount = 0;
    
    for (const doc of toMigrate) {
      // Skip if already marked for deletion
      if (toDelete.includes(doc)) continue;
      
      try {
        const data = doc.data();
        const oldId = doc.id;
        
        // Create new document with proper Firebase ID
        const newDocRef = db.collection('aids_revenues').doc();
        
        batch.set(newDocRef, {
          ...data,
          oldId: oldId,
          migratedAt: new Date().toISOString()
        });
        
        // Delete old document
        batch.delete(doc.ref);
        
        batchCount += 2;
        fixLog.fixed++;
        
        console.log(`Migrating ${oldId} to ${newDocRef.id}`);
        
        // Commit batch every 400 operations
        if (batchCount >= 400) {
          await batch.commit();
          console.log(`Committed batch of ${batchCount} operations`);
          batchCount = 0;
        }
      } catch (error) {
        console.error(`Error migrating ${doc.id}:`, error);
        fixLog.errors.push(`Migrate ${doc.id}: ${error.message}`);
      }
    }
    
    // Commit remaining operations
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} operations`);
    }
    
    console.log('=== FIX COMPLETED ===');
    console.log('Fix log:', fixLog);
    
    return NextResponse.json({
      success: true,
      fixLog,
      message: `✅ Correction terminée: ${fixLog.fixed} IDs migrés, ${fixLog.deleted} doublons supprimés`
    });
    
  } catch (error) {
    console.error('Fatal error in fix:', error);
    return NextResponse.json({
      error: error.message,
      fixLog
    }, { status: 500 });
  }
}