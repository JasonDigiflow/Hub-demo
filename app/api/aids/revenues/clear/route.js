import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';
import inMemoryStore from '@/lib/aids/inMemoryStore';

export async function DELETE() {
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
      return NextResponse.json({ 
        error: 'Non authentifié',
        success: false
      }, { status: 401 });
    }

    // Delete all revenues - try Firebase first, fallback to in-memory
    let count = 0;
    
    if (db && db.collection && db.batch) {
      try {
        const revenuesRef = db.collection('aids_revenues');
        const snapshot = await revenuesRef.get();
        
        if (!snapshot.empty) {
          const batch = db.batch();
          
          snapshot.forEach(doc => {
            const docRef = db.collection('aids_revenues').doc(doc.id);
            batch.delete(docRef);
            count++;
          });
          
          await batch.commit();
          console.log(`Deleted ${count} revenues from Firebase`);
        }
      } catch (error) {
        console.error('Firebase error, using in-memory store:', error.message);
        count = await inMemoryStore.clearRevenues();
        console.log(`Deleted ${count} revenues from memory`);
      }
    } else {
      console.log('Firebase not available, using in-memory store');
      count = await inMemoryStore.clearRevenues();
      console.log(`Deleted ${count} revenues from memory`);
    }
    
    if (count === 0) {
      return NextResponse.json({ 
        success: true,
        message: 'Aucun revenu à supprimer',
        deleted: 0
      });
    }
    
    return NextResponse.json({ 
      success: true,
      message: `${count} revenus supprimés avec succès`,
      deleted: count
    });
    
  } catch (error) {
    console.error('Error clearing revenues:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression des revenus',
      details: error.message,
      success: false
    }, { status: 500 });
  }
}