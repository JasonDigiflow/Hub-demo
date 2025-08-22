import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ 
        error: 'Token manquant'
      }, { status: 400 });
    }
    
    console.log('=== USING MANUAL TOKEN FROM GRAPH API EXPLORER ===');
    
    // Vérifier le token
    const meResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${token}`
    );
    const meData = await meResponse.json();
    
    if (meData.error) {
      return NextResponse.json({ 
        error: 'Token invalide',
        details: meData.error
      }, { status: 400 });
    }
    
    console.log('Token valid for user:', meData.name);
    
    // Récupérer les ad accounts
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_status&limit=100&access_token=${token}`
    );
    const accountsData = await accountsResponse.json();
    
    if (!accountsData.data || accountsData.data.length === 0) {
      return NextResponse.json({ 
        error: 'Aucun compte publicitaire trouvé'
      }, { status: 404 });
    }
    
    console.log(`Found ${accountsData.data.length} ad accounts`);
    
    const allLeads = [];
    const results = [];
    
    // Pour chaque compte, chercher les leads
    for (const account of accountsData.data) {
      console.log(`\n=== Checking account: ${account.name} (${account.id}) ===`);
      
      // 1. Essayer les lead forms
      const formsResponse = await fetch(
        `https://graph.facebook.com/v18.0/${account.id}/leadgen_forms?` +
        `fields=id,name,status,leads_count,page{id,name}&` +
        `limit=100&` +
        `access_token=${token}`
      );
      const formsData = await formsResponse.json();
      
      let accountLeads = 0;
      const forms = [];
      
      if (formsData.data) {
        for (const form of formsData.data) {
          if (form.leads_count > 0) {
            console.log(`Form "${form.name}" has ${form.leads_count} leads`);
            forms.push({
              id: form.id,
              name: form.name,
              leadsCount: form.leads_count
            });
            
            // Récupérer les leads de ce formulaire
            const leadsResponse = await fetch(
              `https://graph.facebook.com/v18.0/${form.id}/leads?` +
              `fields=id,created_time,field_data&` +
              `limit=500&` +
              `access_token=${token}`
            );
            const leadsData = await leadsResponse.json();
            
            if (leadsData.data) {
              console.log(`Retrieved ${leadsData.data.length} leads from form`);
              accountLeads += leadsData.data.length;
              
              // Traiter les leads
              for (const lead of leadsData.data) {
                const fieldData = {};
                if (lead.field_data) {
                  lead.field_data.forEach(field => {
                    fieldData[field.name] = field.values?.[0] || '';
                  });
                }
                
                allLeads.push({
                  id: lead.id,
                  formId: form.id,
                  formName: form.name,
                  accountId: account.id,
                  accountName: account.name,
                  createdTime: lead.created_time,
                  fieldData: fieldData,
                  name: fieldData['full_name'] || fieldData['first_name'] || fieldData['last_name'] || fieldData['name'] || `Lead ${lead.id}`,
                  email: fieldData['email'] || '',
                  phone: fieldData['phone_number'] || fieldData['phone'] || '',
                  company: fieldData['company_name'] || ''
                });
              }
            }
          }
        }
      }
      
      results.push({
        accountId: account.id,
        accountName: account.name,
        formsCount: forms.length,
        totalLeads: accountLeads,
        forms: forms
      });
    }
    
    console.log(`\n=== TOTAL: ${allLeads.length} leads found ===`);
    
    // Sauvegarder dans Firebase si on a des leads
    let savedCount = 0;
    if (allLeads.length > 0) {
      try {
        const authCookie = cookies().get('auth-token');
        if (authCookie) {
          const decoded = jwt.verify(authCookie.value, process.env.JWT_SECRET);
          const userId = decoded.uid;
          
          // Créer/récupérer l'organisation
          const userDoc = await db.collection('users').doc(userId).get();
          let orgId = userDoc.data()?.primaryOrgId;
          
          if (!orgId) {
            // Créer l'organisation
            orgId = `org_${userId}_${Date.now()}`;
            await db.collection('organizations').doc(orgId).set({
              name: meData.name || 'Mon Organisation',
              owner: userId,
              createdAt: new Date().toISOString()
            });
            
            await db.collection('organizations').doc(orgId)
              .collection('members').doc(userId).set({
                role: 'admin',
                createdAt: new Date().toISOString()
              });
            
            await db.collection('users').doc(userId).set({
              email: decoded.email,
              orgIds: [orgId],
              primaryOrgId: orgId
            }, { merge: true });
          }
          
          // Créer/récupérer l'ad account
          const firstAccount = results[0];
          let adAccountId = `adacc_${firstAccount.accountId}`;
          
          await db.collection('organizations').doc(orgId)
            .collection('adAccounts').doc(adAccountId).set({
              platform: 'meta',
              externalId: firstAccount.accountId,
              name: firstAccount.accountName,
              status: 'active',
              createdAt: new Date().toISOString()
            }, { merge: true });
          
          // Sauvegarder les prospects
          const batch = db.batch();
          
          for (const lead of allLeads) {
            const prospectRef = db
              .collection('organizations').doc(orgId)
              .collection('adAccounts').doc(adAccountId)
              .collection('prospects').doc(`lead_${lead.id}`);
            
            batch.set(prospectRef, {
              ...lead,
              source: 'meta',
              status: 'new',
              syncedFromMeta: true,
              createdAt: lead.createdTime || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            savedCount++;
          }
          
          await batch.commit();
          console.log(`✅ Saved ${savedCount} prospects to Firebase`);
        }
      } catch (error) {
        console.error('Error saving to Firebase:', error);
      }
    }
    
    // Sauvegarder le token dans la session pour réutilisation
    cookies().set('meta_session', JSON.stringify({
      accessToken: token,
      userID: meData.id,
      userName: meData.name,
      manualToken: true
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 jours
    });
    
    // Sauvegarder le premier compte comme sélectionné
    if (results.length > 0) {
      cookies().set('selected_ad_account', results[0].accountId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30
      });
    }
    
    return NextResponse.json({
      success: true,
      totalLeads: allLeads.length,
      savedToFirebase: savedCount,
      accounts: results,
      leads: allLeads,
      message: allLeads.length > 0 
        ? `✅ ${allLeads.length} leads trouvés et ${savedCount} sauvegardés!`
        : '❌ Aucun lead trouvé même avec le token manuel'
    });
    
  } catch (error) {
    console.error('Manual token error:', error);
    return NextResponse.json({ 
      error: 'Erreur avec le token manuel',
      details: error.message
    }, { status: 500 });
  }
}