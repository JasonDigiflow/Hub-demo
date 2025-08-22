import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function GET(request, { params }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const userId = decoded.uid;
    const { id } = params;

    const docRef = db.collection('aids_prospects').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Prospect non trouvé' }, { status: 404 });
    }

    const data = doc.data();
    
    // Verify ownership
    if (data.userId !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      prospect: {
        id: doc.id,
        ...data
      }
    });

  } catch (error) {
    console.error('Error fetching prospect:', error);
    return NextResponse.json({
      error: 'Erreur lors de la récupération du prospect',
      details: error.message
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const userId = decoded.uid;
    const { id } = params;
    const updates = await request.json();

    const docRef = db.collection('aids_prospects').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Prospect non trouvé' }, { status: 404 });
    }

    const data = doc.data();
    
    // Verify ownership
    if (data.userId !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Update the document
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      userId // Ensure userId is not changed
    };

    await docRef.update(updatedData);

    return NextResponse.json({
      success: true,
      prospect: {
        id: doc.id,
        ...data,
        ...updatedData
      }
    });

  } catch (error) {
    console.error('Error updating prospect:', error);
    return NextResponse.json({
      error: 'Erreur lors de la mise à jour du prospect',
      details: error.message
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const userId = decoded.uid;
    const { id } = params;

    const docRef = db.collection('aids_prospects').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Prospect non trouvé' }, { status: 404 });
    }

    const data = doc.data();
    
    // Verify ownership
    if (data.userId !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    await docRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Prospect supprimé avec succès'
    });

  } catch (error) {
    console.error('Error deleting prospect:', error);
    return NextResponse.json({
      error: 'Erreur lors de la suppression du prospect',
      details: error.message
    }, { status: 500 });
  }
}