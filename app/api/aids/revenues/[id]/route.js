import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // Update revenue using Firebase Admin
    const docRef = db.collection('aids_revenues').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Revenue not found' },
        { status: 404 }
      );
    }
    
    await docRef.update({
      ...data,
      updatedAt: new Date().toISOString()
    });

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
    
    // Delete revenue using Firebase Admin
    const docRef = db.collection('aids_revenues').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Revenue not found' },
        { status: 404 }
      );
    }
    
    await docRef.delete();

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