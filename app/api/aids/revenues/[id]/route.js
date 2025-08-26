import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';
import inMemoryStore from '@/lib/aids/inMemoryStore';

// Helper function to update prospect status
async function updateProspectStatus(userId, prospectId, amount) {
  console.log(`[updateProspectStatus] Called with userId: ${userId}, prospectId: ${prospectId}, amount: ${amount}`);
  
  if (!userId || !prospectId) {
    console.log('[updateProspectStatus] Missing userId or prospectId, returning');
    return;
  }
  
  try {
    // Get user's organization
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const orgId = userData.primaryOrgId || userId;
    
    console.log(`[updateProspectStatus] Using orgId: ${orgId}`);
    
    // Try to find org ID from orgIds array if primaryOrgId doesn't exist
    let actualOrgId = orgId;
    if (!orgId.startsWith('org_') && userData.orgIds && userData.orgIds.length > 0) {
      actualOrgId = userData.orgIds[0];
      console.log(`[updateProspectStatus] Using orgId from array: ${actualOrgId}`);
    }
    
    // Search for prospect in all ad accounts
    const adAccountsSnapshot = await db
      .collection('organizations').doc(actualOrgId)
      .collection('adAccounts')
      .get();
    
    console.log(`[updateProspectStatus] Found ${adAccountsSnapshot.size} ad accounts`);
    
    let prospectFound = false;
    for (const adAccountDoc of adAccountsSnapshot.docs) {
      const prospectRef = db
        .collection('organizations').doc(actualOrgId)
        .collection('adAccounts').doc(adAccountDoc.id)
        .collection('prospects').doc(prospectId);
      
      const prospectDoc = await prospectRef.get();
      
      if (prospectDoc.exists) {
        console.log(`[updateProspectStatus] Found prospect ${prospectId} in ad account ${adAccountDoc.id}`);
        console.log(`[updateProspectStatus] Updating with amount ${amount}`);
        
        await prospectRef.update({
          status: 'converted',
          revenueAmount: amount,
          updatedAt: new Date().toISOString()
        });
        
        prospectFound = true;
        console.log(`[updateProspectStatus] ✅ Successfully updated prospect ${prospectId}`);
        break;
      }
    }
    
    if (!prospectFound) {
      console.log(`[updateProspectStatus] ⚠️ Prospect ${prospectId} not found in any ad account`);
    }
  } catch (error) {
    console.error('[updateProspectStatus] Error:', error);
  }
}

// Helper function to reset prospect status
async function resetProspectStatus(userId, prospectId) {
  console.log(`[resetProspectStatus] Called with userId: ${userId}, prospectId: ${prospectId}`);
  
  if (!userId || !prospectId) {
    console.log('[resetProspectStatus] Missing userId or prospectId, returning');
    return;
  }
  
  try {
    // Get user's organization
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const orgId = userData.primaryOrgId || userId;
    
    console.log(`[resetProspectStatus] Using orgId: ${orgId}`);
    
    // Try to find org ID from orgIds array if primaryOrgId doesn't exist
    let actualOrgId = orgId;
    if (!orgId.startsWith('org_') && userData.orgIds && userData.orgIds.length > 0) {
      actualOrgId = userData.orgIds[0];
      console.log(`[resetProspectStatus] Using orgId from array: ${actualOrgId}`);
    }
    
    // Search for prospect in all ad accounts
    const adAccountsSnapshot = await db
      .collection('organizations').doc(actualOrgId)
      .collection('adAccounts')
      .get();
    
    console.log(`[resetProspectStatus] Found ${adAccountsSnapshot.size} ad accounts`);
    
    let prospectFound = false;
    for (const adAccountDoc of adAccountsSnapshot.docs) {
      const prospectRef = db
        .collection('organizations').doc(actualOrgId)
        .collection('adAccounts').doc(adAccountDoc.id)
        .collection('prospects').doc(prospectId);
      
      const prospectDoc = await prospectRef.get();
      
      if (prospectDoc.exists) {
        console.log(`[resetProspectStatus] Found prospect ${prospectId} in ad account ${adAccountDoc.id}`);
        console.log(`[resetProspectStatus] Resetting to qualified`);
        
        await prospectRef.update({
          status: 'qualified',
          revenueAmount: null,
          revenueDate: null,
          convertedAt: null,
          updatedAt: new Date().toISOString()
        });
        
        prospectFound = true;
        console.log(`[resetProspectStatus] ✅ Successfully reset prospect ${prospectId}`);
        break;
      }
    }
    
    if (!prospectFound) {
      console.log(`[resetProspectStatus] ⚠️ Prospect ${prospectId} not found in any ad account`);
    }
  } catch (error) {
    console.error('[resetProspectStatus] Error:', error);
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    console.log(`PUT /api/aids/revenues/${id} - Updating revenue`);
    console.log('Update data:', data);
    
    // Get current user ID from auth
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
    
    console.log('Authenticated user ID:', userId);
    
    // Update revenue - try Firebase first, fallback to in-memory
    let success = false;
    
    if (db && db.collection) {
      try {
        const docRef = db.collection('aids_revenues').doc(id);
        const doc = await docRef.get();
        
        console.log(`Revenue ${id} exists in Firebase:`, doc.exists);
        
        if (doc.exists) {
          // Récupérer les données existantes pour le prospect
          const existingData = doc.data();
          
          // Ne pas écraser l'ID existant
          const { id: dataId, ...updateData } = data;
          await docRef.update({
            ...updateData,
            updatedAt: new Date().toISOString()
          });
          success = true;
          console.log(`Revenue ${id} updated successfully in Firebase`);
          
          // Si le montant ou le prospectId a changé, mettre à jour le prospect
          if ((updateData.amount && updateData.amount !== existingData.amount) || 
              (updateData.prospectId && updateData.prospectId !== existingData.prospectId)) {
            console.log('Amount or prospect changed, updating prospect status');
            
            // Mettre à jour le nouveau prospect si nécessaire
            if (updateData.prospectId) {
              await updateProspectStatus(userId, updateData.prospectId, updateData.amount);
            }
            
            // Si le prospect a changé, réinitialiser l'ancien
            if (existingData.prospectId && existingData.prospectId !== updateData.prospectId) {
              await resetProspectStatus(userId, existingData.prospectId);
            }
          }
        } else {
          // Si le document n'existe pas mais que l'ID ressemble à un timestamp,
          // essayer de créer un nouveau document
          if (id && /^\d{13}$/.test(id)) {
            console.log(`Revenue ${id} not found, creating new document for legacy ID`);
            await docRef.set({
              ...data,
              updatedAt: new Date().toISOString(),
              createdAt: new Date().toISOString()
            });
            success = true;
            console.log(`Revenue ${id} created in Firebase with legacy ID`);
          }
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
      console.error(`Revenue ${id} not found in any storage`);
      return NextResponse.json(
        { error: 'Revenue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: `Revenue ${id} updated successfully`
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
    
    console.log(`DELETE /api/aids/revenues/${id} - Deleting revenue`);
    
    // Get current user ID from auth
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
    
    console.log('Authenticated user ID:', userId);
    
    // First get the revenue to find associated prospect
    let revenueData = null;
    let success = false;
    
    if (db && db.collection) {
      try {
        const docRef = db.collection('aids_revenues').doc(id);
        const doc = await docRef.get();
        
        console.log(`Revenue ${id} exists in Firebase:`, doc.exists);
        
        if (doc.exists) {
          revenueData = doc.data();
          await docRef.delete();
          success = true;
          console.log(`Revenue ${id} deleted from Firebase`);
        } else if (/^\d{13}$/.test(id)) {
          // Si l'ID est un timestamp, chercher dans tous les documents
          console.log(`Revenue ${id} not found, searching for timestamp ID in all documents`);
          
          const allRevenues = await db.collection('aids_revenues').get();
          for (const revDoc of allRevenues.docs) {
            const revData = revDoc.data();
            // Chercher par oldId ou par correspondance de données
            if (revData.oldId === id || revDoc.id === id) {
              console.log(`Found revenue with oldId ${id}, deleting document ${revDoc.id}`);
              revenueData = revData;
              await revDoc.ref.delete();
              success = true;
              break;
            }
          }
        }
        
        // If revenue had a prospect associated, update its status
        if (success && revenueData && revenueData.prospectId) {
          console.log(`Revenue deleted, resetting prospect ${revenueData.prospectId} status`);
          await resetProspectStatus(userId, revenueData.prospectId);
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
      message: 'Revenue deleted and prospect status updated successfully'
    });
  } catch (error) {
    console.error('Error deleting revenue:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}