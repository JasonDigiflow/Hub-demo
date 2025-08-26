import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function POST() {
  const migrationLog = {
    checked: 0,
    migrated: 0,
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
    
    console.log('=== REVENUE MIGRATION STARTED ===');
    console.log('User ID:', userId);
    
    // Get all existing revenues
    const snapshot = await db.collection('aids_revenues').get();
    console.log(`Found ${snapshot.size} revenues in Firebase`);
    
    const batch = db.batch();
    let batchCount = 0;
    
    for (const doc of snapshot.docs) {
      migrationLog.checked++;
      const data = doc.data();
      const currentId = doc.id;
      
      // Check if the ID is a timestamp (13 digits)
      if (/^\d{13}$/.test(currentId)) {
        console.log(`Found legacy timestamp ID: ${currentId}`);
        
        try {
          // Create new document with proper Firebase ID
          const newDocRef = db.collection('aids_revenues').doc();
          
          // Copy all data to new document
          batch.set(newDocRef, {
            ...data,
            oldId: currentId, // Keep track of old ID
            migratedAt: new Date().toISOString()
          });
          
          // Delete old document
          batch.delete(doc.ref);
          
          batchCount += 2; // One set, one delete
          migrationLog.migrated++;
          
          console.log(`Migrating ${currentId} to ${newDocRef.id}`);
          
          // Commit batch every 400 operations (Firebase limit is 500)
          if (batchCount >= 400) {
            await batch.commit();
            console.log(`Committed batch of ${batchCount} operations`);
            batchCount = 0;
          }
        } catch (error) {
          console.error(`Error migrating revenue ${currentId}:`, error);
          migrationLog.errors.push(`${currentId}: ${error.message}`);
        }
      } else {
        console.log(`Skipping ${currentId} - already has proper Firebase ID`);
      }
    }
    
    // Commit remaining operations
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} operations`);
    }
    
    // Also clean up any duplicates (same clientName and amount)
    const revenuesSnapshot = await db.collection('aids_revenues').get();
    const seen = new Map();
    const duplicates = [];
    
    revenuesSnapshot.forEach(doc => {
      const data = doc.data();
      const key = `${data.clientName}_${data.amount}_${data.date}`;
      
      if (seen.has(key)) {
        duplicates.push(doc.id);
        console.log(`Found duplicate: ${doc.id} (duplicate of ${seen.get(key)})`);
      } else {
        seen.set(key, doc.id);
      }
    });
    
    // Delete duplicates
    for (const dupId of duplicates) {
      try {
        await db.collection('aids_revenues').doc(dupId).delete();
        migrationLog.deleted++;
        console.log(`Deleted duplicate revenue: ${dupId}`);
      } catch (error) {
        console.error(`Error deleting duplicate ${dupId}:`, error);
        migrationLog.errors.push(`Delete ${dupId}: ${error.message}`);
      }
    }
    
    console.log('=== MIGRATION COMPLETED ===');
    console.log('Migration log:', migrationLog);
    
    return NextResponse.json({
      success: true,
      migrationLog,
      message: `✅ Migration terminée: ${migrationLog.migrated} revenus migrés, ${migrationLog.deleted} doublons supprimés`
    });
    
  } catch (error) {
    console.error('Fatal error in migration:', error);
    return NextResponse.json({
      error: error.message,
      migrationLog
    }, { status: 500 });
  }
}