import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function POST(request) {
  const logs = [];
  const log = (message, data = null) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
      ...(data && { data })
    };
    logs.push(logEntry);
    console.log(`[RESET] ${message}`, data || '');
  };

  try {
    log('=== DÉBUT DU RESET COMPLET ===');
    
    // Get user authentication
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth-token') || cookieStore.get('auth_token');
    const metaSession = cookieStore.get('meta_session');
    
    let userId = null;
    
    if (authCookie) {
      try {
        const decoded = jwt.verify(authCookie.value, process.env.JWT_SECRET || 'default-secret-key');
        userId = decoded.uid || decoded.userId || decoded.id;
        log('Auth token trouvé', { userId });
      } catch (e) {
        log('Erreur JWT', { error: e.message });
      }
    }
    
    if (!userId && metaSession) {
      try {
        const session = JSON.parse(metaSession.value);
        userId = session.userID || session.userId;
        log('Meta session trouvée', { userId });
      } catch (e) {
        log('Erreur Meta session', { error: e.message });
      }
    }
    
    if (!userId) {
      log('Aucune authentification trouvée');
      return NextResponse.json({ 
        error: 'Non authentifié',
        logs 
      }, { status: 401 });
    }
    
    // Get user's organization
    let orgId = userId;
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        orgId = userData.primaryOrgId || userId;
        log('Organisation trouvée', { orgId, userData });
      } else {
        log('Pas de document utilisateur, utilisation du userId comme orgId');
      }
    } catch (error) {
      log('Erreur récupération organisation', { error: error.message });
    }
    
    const results = {
      prospects: {
        deleted: 0,
        errors: []
      },
      revenues: {
        deleted: 0,
        errors: []
      }
    };
    
    // 1. SUPPRIMER TOUS LES PROSPECTS
    log('--- Suppression des prospects ---');
    try {
      // Get all ad accounts
      const adAccountsSnapshot = await db
        .collection('organizations').doc(orgId)
        .collection('adAccounts')
        .get();
      
      log(`${adAccountsSnapshot.size} comptes publicitaires trouvés`);
      
      for (const adAccountDoc of adAccountsSnapshot.docs) {
        const adAccountId = adAccountDoc.id;
        log(`Traitement du compte publicitaire: ${adAccountId}`);
        
        try {
          // Get all prospects in this ad account
          const prospectsSnapshot = await db
            .collection('organizations').doc(orgId)
            .collection('adAccounts').doc(adAccountId)
            .collection('prospects')
            .get();
          
          log(`${prospectsSnapshot.size} prospects trouvés dans ${adAccountId}`);
          
          // Delete each prospect
          let batch = db.batch();
          let batchCount = 0;
          
          for (const doc of prospectsSnapshot.docs) {
            batch.delete(doc.ref);
            batchCount++;
            
            // Firestore limite: 500 opérations par batch
            if (batchCount === 500) {
              await batch.commit();
              results.prospects.deleted += batchCount;
              log(`Batch de ${batchCount} suppressions committé`);
              // Créer un nouveau batch pour les prochaines suppressions
              batch = db.batch();
              batchCount = 0;
            }
          }
          
          // Commit remaining operations
          if (batchCount > 0) {
            await batch.commit();
            results.prospects.deleted += batchCount;
            log(`Dernier batch de ${batchCount} suppressions committé`);
          }
          
          // Vérifier que la suppression a fonctionné
          const verifySnapshot = await db
            .collection('organizations').doc(orgId)
            .collection('adAccounts').doc(adAccountId)
            .collection('prospects')
            .get();
          
          if (!verifySnapshot.empty) {
            log(`⚠️ ATTENTION: ${verifySnapshot.size} prospects encore présents après suppression!`);
            // Essayer une suppression individuelle
            log('Tentative de suppression individuelle...');
            for (const doc of prospectsSnapshot.docs) {
              try {
                await doc.ref.delete();
                results.prospects.deleted++;
              } catch (e) {
                log(`Erreur suppression individuelle: ${e.message}`);
              }
            }
          } else {
            log(`✅ ${prospectsSnapshot.size} prospects supprimés avec succès dans ${adAccountId}`);
          }
          
        } catch (error) {
          const errorMsg = `Erreur suppression prospects dans ${adAccountId}: ${error.message}`;
          log(errorMsg);
          results.prospects.errors.push(errorMsg);
        }
      }
    } catch (error) {
      const errorMsg = `Erreur globale suppression prospects: ${error.message}`;
      log(errorMsg);
      results.prospects.errors.push(errorMsg);
    }
    
    // 2. SUPPRIMER TOUS LES REVENUS
    log('--- Suppression des revenus ---');
    try {
      const revenuesSnapshot = await db
        .collection('aids_revenues')
        .get();
      
      log(`${revenuesSnapshot.size} revenus trouvés`);
      
      let batch = db.batch();
      let batchCount = 0;
      
      for (const doc of revenuesSnapshot.docs) {
        batch.delete(doc.ref);
        batchCount++;
        
        if (batchCount === 500) {
          await batch.commit();
          results.revenues.deleted += batchCount;
          log(`Batch de ${batchCount} revenus supprimés`);
          // Créer un nouveau batch pour les prochaines suppressions
          batch = db.batch();
          batchCount = 0;
        }
      }
      
      if (batchCount > 0) {
        await batch.commit();
        results.revenues.deleted += batchCount;
        log(`Dernier batch de ${batchCount} revenus supprimés`);
      }
      
      // Vérifier que la suppression a fonctionné
      const verifyRevenuesSnapshot = await db
        .collection('aids_revenues')
        .get();
      
      if (!verifyRevenuesSnapshot.empty) {
        log(`⚠️ ATTENTION: ${verifyRevenuesSnapshot.size} revenus encore présents après suppression!`);
        // Essayer une suppression individuelle
        log('Tentative de suppression individuelle des revenus...');
        const allRevenues = await db.collection('aids_revenues').get();
        for (const doc of allRevenues.docs) {
          try {
            await doc.ref.delete();
            results.revenues.deleted++;
          } catch (e) {
            log(`Erreur suppression individuelle revenu: ${e.message}`);
          }
        }
      } else {
        log(`✅ Total: ${results.revenues.deleted} revenus supprimés avec succès`);
      }
      
    } catch (error) {
      const errorMsg = `Erreur suppression revenus: ${error.message}`;
      log(errorMsg);
      results.revenues.errors.push(errorMsg);
    }
    
    // 3. NETTOYER L'ANCIENNE STRUCTURE (si elle existe)
    log('--- Nettoyage ancienne structure ---');
    try {
      const oldProspectsSnapshot = await db
        .collection('aids_prospects')
        .where('userId', '==', userId)
        .get();
      
      if (oldProspectsSnapshot.size > 0) {
        log(`${oldProspectsSnapshot.size} anciens prospects trouvés`);
        
        const batch = db.batch();
        oldProspectsSnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        
        log(`✅ ${oldProspectsSnapshot.size} anciens prospects supprimés`);
      } else {
        log('Aucun ancien prospect trouvé');
      }
    } catch (error) {
      log('Erreur nettoyage ancienne structure (ignorée)', { error: error.message });
    }
    
    log('=== RESET COMPLET TERMINÉ ===');
    
    return NextResponse.json({
      success: true,
      results,
      summary: {
        prospectsDeleted: results.prospects.deleted,
        revenuesDeleted: results.revenues.deleted,
        errors: [...results.prospects.errors, ...results.revenues.errors]
      },
      logs,
      message: `✅ Reset terminé: ${results.prospects.deleted} prospects et ${results.revenues.deleted} revenus supprimés`
    });
    
  } catch (error) {
    log('ERREUR FATALE', { error: error.message, stack: error.stack });
    return NextResponse.json({
      error: error.message,
      logs
    }, { status: 500 });
  }
}