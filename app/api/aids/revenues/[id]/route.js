import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import inMemoryStore from '@/lib/aids/inMemoryStore';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // Update revenue - try Firebase first, fallback to in-memory
    let success = false;
    
    if (db && db.collection) {
      try {
        const docRef = db.collection('aids_revenues').doc(id);
        const doc = await docRef.get();
        
        if (doc.exists) {
          await docRef.update({
            ...data,
            updatedAt: new Date().toISOString()
          });
          success = true;
        }
      } catch (error) {
        console.error('Firebase error, using in-memory store:', error.message);
        success = await inMemoryStore.updateRevenue(id, data);
      }
    } else {
      console.log('Firebase not available, using in-memory store');
      success = await inMemoryStore.updateRevenue(id, data);
    }
    
    if (!success) {
      return NextResponse.json(
        { error: 'Revenue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true
    });
  } catch (error) {
    console.error('Error updating revenue:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Delete revenue - try Firebase first, fallback to in-memory
    let success = false;
    
    if (db && db.collection) {
      try {
        const docRef = db.collection('aids_revenues').doc(id);
        const doc = await docRef.get();
        
        if (doc.exists) {
          await docRef.delete();
          success = true;
        }
      } catch (error) {
        console.error('Firebase error, using in-memory store:', error.message);
        success = await inMemoryStore.deleteRevenue(id);
      }
    } else {
      console.log('Firebase not available, using in-memory store');
      success = await inMemoryStore.deleteRevenue(id);
    }
    
    if (!success) {
      return NextResponse.json(
        { error: 'Revenue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Revenue deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting revenue:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}