import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';
import { validateProspect, generateId } from '@/lib/schemas/organization';

/**
 * GET /api/organizations/[orgId]/adAccounts/[adAccountId]/prospects
 * Récupère les prospects d'un ad account
 */
export async function GET(request, { params }) {
  try {
    const { orgId, adAccountId } = params;
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier le JWT
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const userId = decoded.uid;

    // Vérifier que l'utilisateur est membre de l'organisation
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData || !userData.orgIds?.includes(orgId)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer les prospects
    const prospectsRef = db
      .collection('organizations').doc(orgId)
      .collection('adAccounts').doc(adAccountId)
      .collection('prospects');
    
    const snapshot = await prospectsRef
      .orderBy('createdAt', 'desc')
      .limit(500)
      .get();

    const prospects = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Filtrer les données agrégées
      if (!data.isAggregated && 
          !data.name?.includes('[Données agrégées') &&
          !data.name?.includes('[Données campagne')) {
        prospects.push({
          id: doc.id,
          ...data
        });
      }
    });

    console.log(`[GET prospects] Org: ${orgId}, AdAccount: ${adAccountId}, Found: ${prospects.length}`);

    return NextResponse.json({
      success: true,
      prospects,
      count: prospects.length,
      orgId,
      adAccountId
    });

  } catch (error) {
    console.error('Error fetching prospects:', error);
    return NextResponse.json({
      error: 'Erreur lors de la récupération des prospects',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * POST /api/organizations/[orgId]/adAccounts/[adAccountId]/prospects
 * Crée un nouveau prospect
 */
export async function POST(request, { params }) {
  try {
    const { orgId, adAccountId } = params;
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const userId = decoded.uid;

    // Vérifier l'accès
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData || !userData.orgIds?.includes(orgId)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Vérifier le rôle (admin ou member)
    const memberDoc = await db
      .collection('organizations').doc(orgId)
      .collection('members').doc(userId)
      .get();
    
    if (!memberDoc.exists || memberDoc.data().role === 'viewer') {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const data = await request.json();

    // Valider et nettoyer les données
    const prospectData = {
      ...data,
      id: data.id || generateId('prospect'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
      source: data.source || 'manual'
    };

    // Valider avec le schéma
    const validatedProspect = validateProspect(prospectData);

    // Sauvegarder dans Firebase
    const prospectsRef = db
      .collection('organizations').doc(orgId)
      .collection('adAccounts').doc(adAccountId)
      .collection('prospects');
    
    const docRef = prospectsRef.doc(validatedProspect.id);
    await docRef.set(validatedProspect);

    console.log(`[POST prospect] Created: ${validatedProspect.id} in ${orgId}/${adAccountId}`);

    return NextResponse.json({
      success: true,
      id: validatedProspect.id,
      prospect: validatedProspect
    });

  } catch (error) {
    console.error('Error creating prospect:', error);
    return NextResponse.json({
      error: 'Erreur lors de la création du prospect',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * PUT /api/organizations/[orgId]/adAccounts/[adAccountId]/prospects
 * Import en masse de prospects (depuis Meta ou autre)
 */
export async function PUT(request, { params }) {
  try {
    const { orgId, adAccountId } = params;
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const userId = decoded.uid;

    // Vérifier l'accès admin
    const memberDoc = await db
      .collection('organizations').doc(orgId)
      .collection('members').doc(userId)
      .get();
    
    if (!memberDoc.exists || memberDoc.data().role !== 'admin') {
      return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
    }

    const { prospects, source, forceSync } = await request.json();

    if (!prospects || !Array.isArray(prospects)) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    const prospectsRef = db
      .collection('organizations').doc(orgId)
      .collection('adAccounts').doc(adAccountId)
      .collection('prospects');
    
    const batch = db.batch();
    const importedIds = [];

    // Récupérer les IDs Meta existants pour éviter les doublons
    let existingMetaIds = new Set();
    if (!forceSync) {
      const existingSnapshot = await prospectsRef
        .where('syncedFromMeta', '==', true)
        .get();
      
      existingSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.metaId) {
          existingMetaIds.add(data.metaId);
        }
      });
    }

    console.log(`[PUT prospects] Importing ${prospects.length} prospects, existing: ${existingMetaIds.size}`);

    // Traiter chaque prospect
    for (const prospect of prospects) {
      // Vérifier si le prospect existe déjà (sauf si forceSync)
      if (!forceSync && prospect.metaId && existingMetaIds.has(prospect.metaId)) {
        continue;
      }

      const prospectData = {
        ...prospect,
        id: prospect.id || generateId('prospect'),
        syncedFromMeta: true,
        source: source || 'Meta',
        createdAt: prospect.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: new Date().toISOString(),
        importedBy: userId
      };

      // Valider
      try {
        const validatedProspect = validateProspect(prospectData);
        const docRef = prospectsRef.doc(validatedProspect.id);
        batch.set(docRef, validatedProspect);
        importedIds.push(validatedProspect.id);
      } catch (validationError) {
        console.error(`Validation error for prospect ${prospect.id}:`, validationError);
      }
    }

    // Commit le batch
    if (importedIds.length > 0) {
      await batch.commit();
      console.log(`[PUT prospects] Imported ${importedIds.length} prospects to ${orgId}/${adAccountId}`);
    }

    return NextResponse.json({
      success: true,
      imported: importedIds.length,
      skipped: prospects.length - importedIds.length,
      total: prospects.length,
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