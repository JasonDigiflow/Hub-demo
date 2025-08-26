import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import inMemoryStore from '@/lib/aids/inMemoryStore';

export async function GET() {
  try {
    // Test Firebase initialization
    const isFirebaseReady = db && db.isInitialized && db.isInitialized();
    
    // Try to get revenues from both sources
    let firebaseRevenues = [];
    let memoryRevenues = [];
    let firebaseError = null;
    
    if (isFirebaseReady) {
      try {
        const revenuesRef = db.collection('aids_revenues');
        const snapshot = await revenuesRef.get();
        
        snapshot.forEach(doc => {
          firebaseRevenues.push({
            id: doc.id,
            ...doc.data()
          });
        });
      } catch (error) {
        firebaseError = error.message;
      }
    }
    
    // Always get memory revenues
    memoryRevenues = await inMemoryStore.getAllRevenues();
    
    return NextResponse.json({
      firebaseInitialized: isFirebaseReady,
      firebaseRevenues: {
        count: firebaseRevenues.length,
        data: firebaseRevenues,
        error: firebaseError
      },
      memoryRevenues: {
        count: memoryRevenues.length,
        data: memoryRevenues
      },
      activeStorage: isFirebaseReady && !firebaseError ? 'Firebase' : 'In-Memory'
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}