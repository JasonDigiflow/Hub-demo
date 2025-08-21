import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

export async function GET() {
  const results = {
    firestoreAvailable: db !== null,
    testWrite: false,
    testRead: false,
    error: null,
    collections: [],
    timestamp: new Date().toISOString()
  };

  if (!db) {
    return NextResponse.json({
      ...results,
      error: 'Firestore is not initialized. Check Firebase configuration.'
    });
  }

  try {
    // Test write
    console.log('Testing Firestore write...');
    const testDoc = {
      test: true,
      timestamp: serverTimestamp(),
      message: 'Test document from DigiFlow Hub'
    };
    
    const docRef = await addDoc(collection(db, 'test_collection'), testDoc);
    results.testWrite = true;
    results.writeId = docRef.id;
    console.log('Write successful:', docRef.id);

    // Test read
    console.log('Testing Firestore read...');
    const querySnapshot = await getDocs(collection(db, 'test_collection'));
    results.testRead = true;
    results.documentCount = querySnapshot.size;
    console.log('Read successful:', querySnapshot.size, 'documents');

    // List available collections (limited)
    try {
      const collections = ['users', 'organizations', 'aids_revenues', 'test_collection'];
      for (const collName of collections) {
        const snapshot = await getDocs(collection(db, collName));
        results.collections.push({
          name: collName,
          count: snapshot.size
        });
      }
    } catch (e) {
      console.log('Could not list collections:', e.message);
    }

    return NextResponse.json(results);

  } catch (error) {
    console.error('Firestore test error:', error);
    return NextResponse.json({
      ...results,
      error: error.message,
      errorCode: error.code,
      errorStack: error.stack
    });
  }
}