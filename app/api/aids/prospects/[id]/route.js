import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    console.log(`Updating prospect ${id} with data:`, data);
    
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
      console.log('No user ID found, cannot update prospect');
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    // Get user's organization
    let orgId = userId; // Default to userId as orgId
    
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        orgId = userData.primaryOrgId || userId;
      }
    } catch (error) {
      console.log('Could not fetch user org, using userId as orgId');
    }
    
    console.log(`Looking for prospect ${id} in org ${orgId}`);
    
    // Find the prospect in any ad account
    let prospectFound = false;
    let prospectRef = null;
    let currentProspectData = null;
    
    try {
      // Try to get all ad accounts for this organization
      const adAccountsSnapshot = await db
        .collection('organizations').doc(orgId)
        .collection('adAccounts')
        .get();
      
      console.log(`Found ${adAccountsSnapshot.size} ad accounts for org ${orgId}`);
      
      // Search for the prospect in each ad account
      for (const adAccountDoc of adAccountsSnapshot.docs) {
        const adAccountId = adAccountDoc.id;
        
        // Essayer d'abord avec l'ID direct
        let ref = db
          .collection('organizations').doc(orgId)
          .collection('adAccounts').doc(adAccountId)
          .collection('prospects').doc(id);
        
        let prospectDoc = await ref.get();
        
        // Si pas trouvé et que l'ID commence par LEAD_, chercher par metaId
        if (!prospectDoc.exists && id.startsWith('LEAD_')) {
          console.log(`Searching for prospect with metaId: ${id} in ${adAccountId}`);
          const prospectsSnapshot = await db
            .collection('organizations').doc(orgId)
            .collection('adAccounts').doc(adAccountId)
            .collection('prospects')
            .where('metaId', '==', id)
            .limit(1)
            .get();
          
          if (!prospectsSnapshot.empty) {
            prospectDoc = prospectsSnapshot.docs[0];
            ref = prospectDoc.ref;
            console.log(`Found prospect with Firebase ID: ${prospectDoc.id} and metaId: ${id}`);
          }
        }
        
        // Si toujours pas trouvé, chercher par id dans les données
        if (!prospectDoc.exists) {
          console.log(`Searching for prospect with id field: ${id} in ${adAccountId}`);
          const prospectsSnapshot = await db
            .collection('organizations').doc(orgId)
            .collection('adAccounts').doc(adAccountId)
            .collection('prospects')
            .where('id', '==', id)
            .limit(1)
            .get();
          
          if (!prospectsSnapshot.empty) {
            prospectDoc = prospectsSnapshot.docs[0];
            ref = prospectDoc.ref;
            console.log(`Found prospect with Firebase ID: ${prospectDoc.id} and id field: ${id}`);
          }
        }
        
        if (prospectDoc.exists) {
          console.log(`Found prospect ${id} in ad account ${adAccountId}`);
          prospectFound = true;
          prospectRef = ref;
          currentProspectData = prospectDoc.data();
          break;
        }
      }
    } catch (error) {
      console.error('Error searching for prospect in ad accounts:', error);
    }
    
    // If not found in ad accounts, create it in default location
    if (!prospectFound) {
      console.log(`Prospect ${id} not found, creating in default location`);
      
      const defaultAdAccountId = 'default';
      prospectRef = db
        .collection('organizations').doc(orgId)
        .collection('adAccounts').doc(defaultAdAccountId)
        .collection('prospects').doc(id);
      
      // Create the prospect with initial data
      const newProspectData = {
        id,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        orgId,
        adAccountId: defaultAdAccountId
      };
      
      await prospectRef.set(newProspectData);
      
      console.log(`Created prospect ${id} with status ${data.status} and amount ${data.revenueAmount}`);
      
      return NextResponse.json({
        success: true,
        created: true,
        message: 'Prospect créé et mis à jour'
      });
    }
    
    // Update the existing prospect
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // If status is being changed to converted, ensure we have the conversion data
    if (data.status === 'converted' || data.status === 'closing') {
      if (!updateData.convertedAt) {
        updateData.convertedAt = new Date().toISOString();
      }
      if (!updateData.closingDate) {
        updateData.closingDate = new Date().toISOString();
      }
    }
    
    // Preserve existing notes if they exist
    if (currentProspectData && currentProspectData.notes && !updateData.notes) {
      updateData.notes = currentProspectData.notes;
    }
    
    await prospectRef.update(updateData);
    
    console.log(`Updated prospect ${id} with status ${data.status} and amount ${data.revenueAmount}`);
    
    return NextResponse.json({
      success: true,
      updated: true,
      message: 'Prospect mis à jour avec succès'
    });
    
  } catch (error) {
    console.error('Error updating prospect:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du prospect', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
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
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    // Get user's organization
    let orgId = userId;
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        orgId = userData.primaryOrgId || userId;
      }
    } catch (error) {
      console.log('Could not fetch user org, using userId as orgId');
    }
    
    // Search for the prospect in all ad accounts
    try {
      const adAccountsSnapshot = await db
        .collection('organizations').doc(orgId)
        .collection('adAccounts')
        .get();
      
      for (const adAccountDoc of adAccountsSnapshot.docs) {
        const adAccountId = adAccountDoc.id;
        
        // Essayer d'abord avec l'ID direct
        let prospectRef = db
          .collection('organizations').doc(orgId)
          .collection('adAccounts').doc(adAccountId)
          .collection('prospects').doc(id);
        
        let prospectDoc = await prospectRef.get();
        
        // Si pas trouvé et que l'ID commence par LEAD_, chercher par metaId
        if (!prospectDoc.exists && id.startsWith('LEAD_')) {
          const prospectsSnapshot = await db
            .collection('organizations').doc(orgId)
            .collection('adAccounts').doc(adAccountId)
            .collection('prospects')
            .where('metaId', '==', id)
            .limit(1)
            .get();
          
          if (!prospectsSnapshot.empty) {
            prospectDoc = prospectsSnapshot.docs[0];
          }
        }
        
        // Si toujours pas trouvé, chercher par id dans les données
        if (!prospectDoc.exists) {
          const prospectsSnapshot = await db
            .collection('organizations').doc(orgId)
            .collection('adAccounts').doc(adAccountId)
            .collection('prospects')
            .where('id', '==', id)
            .limit(1)
            .get();
          
          if (!prospectsSnapshot.empty) {
            prospectDoc = prospectsSnapshot.docs[0];
          }
        }
        
        if (prospectDoc.exists) {
          return NextResponse.json({
            success: true,
            prospect: {
              id: prospectDoc.id,
              ...prospectDoc.data()
            }
          });
        }
      }
    } catch (error) {
      console.error('Error searching for prospect:', error);
    }
    
    return NextResponse.json(
      { error: 'Prospect non trouvé' },
      { status: 404 }
    );
    
  } catch (error) {
    console.error('Error fetching prospect:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du prospect' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
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
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    // Get user's organization
    let orgId = userId;
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        orgId = userData.primaryOrgId || userId;
      }
    } catch (error) {
      console.log('Could not fetch user org, using userId as orgId');
    }
    
    // Search and delete the prospect
    try {
      const adAccountsSnapshot = await db
        .collection('organizations').doc(orgId)
        .collection('adAccounts')
        .get();
      
      for (const adAccountDoc of adAccountsSnapshot.docs) {
        const adAccountId = adAccountDoc.id;
        
        // Essayer d'abord avec l'ID direct
        let prospectRef = db
          .collection('organizations').doc(orgId)
          .collection('adAccounts').doc(adAccountId)
          .collection('prospects').doc(id);
        
        let prospectDoc = await prospectRef.get();
        
        // Si pas trouvé et que l'ID commence par LEAD_, chercher par metaId
        if (!prospectDoc.exists && id.startsWith('LEAD_')) {
          const prospectsSnapshot = await db
            .collection('organizations').doc(orgId)
            .collection('adAccounts').doc(adAccountId)
            .collection('prospects')
            .where('metaId', '==', id)
            .limit(1)
            .get();
          
          if (!prospectsSnapshot.empty) {
            prospectDoc = prospectsSnapshot.docs[0];
            prospectRef = prospectDoc.ref;
          }
        }
        
        // Si toujours pas trouvé, chercher par id dans les données
        if (!prospectDoc.exists) {
          const prospectsSnapshot = await db
            .collection('organizations').doc(orgId)
            .collection('adAccounts').doc(adAccountId)
            .collection('prospects')
            .where('id', '==', id)
            .limit(1)
            .get();
          
          if (!prospectsSnapshot.empty) {
            prospectDoc = prospectsSnapshot.docs[0];
            prospectRef = prospectDoc.ref;
          }
        }
        
        if (prospectDoc.exists) {
          await prospectRef.delete();
          return NextResponse.json({
            success: true,
            message: 'Prospect supprimé avec succès'
          });
        }
      }
    } catch (error) {
      console.error('Error deleting prospect:', error);
    }
    
    return NextResponse.json(
      { error: 'Prospect non trouvé' },
      { status: 404 }
    );
    
  } catch (error) {
    console.error('Error deleting prospect:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du prospect' },
      { status: 500 }
    );
  }
}