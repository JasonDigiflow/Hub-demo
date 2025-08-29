import { NextResponse } from 'next/server';
import { getMetaTokenForUser, getOrgAdAccounts } from '@/lib/meta-token-manager';
import { db } from '@/lib/firebase-admin';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

// Protection basique par API key
function isAuthorized(request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'default-cron-secret';
  
  // Accepter soit le header Authorization, soit un secret dans l'URL
  const { searchParams } = new URL(request.url);
  const urlSecret = searchParams.get('secret');
  
  return authHeader === `Bearer ${cronSecret}` || urlSecret === cronSecret;
}

export async function POST(request) {
  try {
    // Vérifier l'autorisation (pour éviter les appels non autorisés)
    if (!isAuthorized(request)) {
      return NextResponse.json({ 
        error: 'Non autorisé' 
      }, { status: 401 });
    }
    
    aidsLogger.info(LogCategories.SYNC, 'Démarrage sync lite');
    
    // Récupérer tous les utilisateurs avec connexion Meta
    const usersSnapshot = await db.collection('users').get();
    const syncResults = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Vérifier si l'utilisateur a une connexion Meta
      if (!userData.metaConnection) {
        continue;
      }
      
      const uid = userDoc.id;
      
      try {
        // Récupérer le token
        const tokenInfo = await getMetaTokenForUser(uid);
        
        if (!tokenInfo.success) {
          aidsLogger.warning(LogCategories.SYNC, `Sync lite: Token invalide pour ${uid}`);
          continue;
        }
        
        // Récupérer les ad accounts de l'organisation
        const orgId = userData.primaryOrgId || `org_${uid}`;
        const accountsInfo = await getOrgAdAccounts(orgId);
        
        if (!accountsInfo.success || !accountsInfo.accounts.length) {
          continue;
        }
        
        // Pour chaque compte, faire un appel léger
        for (const account of accountsInfo.accounts) {
          // Alterner entre différentes périodes pour varier les appels
          const periods = ['today', 'yesterday', 'last_7d', 'last_30d'];
          const period = periods[Math.floor(Math.random() * periods.length)];
          
          try {
            // Appel minimal pour générer du trafic API
            const insightsResponse = await fetch(
              `https://graph.facebook.com/v18.0/${account.id}/insights?` +
              `fields=spend,impressions,clicks&` +
              `date_preset=${period}&` +
              `access_token=${tokenInfo.token}`
            );
            
            const insightsData = await insightsResponse.json();
            
            if (insightsData.error) {
              aidsLogger.error(LogCategories.META_API, 'Erreur sync lite insights', {
                account: account.id,
                error: insightsData.error
              });
              continue;
            }
            
            // Stocker un résumé dans les logs
            const syncLog = {
              uid: uid,
              orgId: orgId,
              accountId: account.id,
              accountName: account.name,
              period: period,
              timestamp: new Date().toISOString(),
              success: true,
              metrics: insightsData.data?.[0] || { spend: 0, impressions: 0, clicks: 0 }
            };
            
            // Sauvegarder dans syncLogs
            await db.collection('organizations')
              .doc(orgId)
              .collection('syncLogs')
              .add(syncLog);
            
            // Mettre à jour lastSync sur le compte
            await db.collection('organizations').doc(orgId).update({
              [`adAccounts.${accountsInfo.accounts.indexOf(account)}.lastSync`]: Date.now(),
              updatedAt: new Date().toISOString()
            });
            
            syncResults.push({
              uid: uid,
              accountId: account.id,
              success: true
            });
            
          } catch (apiError) {
            aidsLogger.error(LogCategories.META_API, 'Erreur appel API sync lite', {
              account: account.id,
              error: apiError.message
            });
          }
        }
        
      } catch (userError) {
        aidsLogger.error(LogCategories.SYNC, `Erreur sync lite pour utilisateur ${uid}`, {
          error: userError.message
        });
      }
    }
    
    // Nettoyer les vieux logs (garder seulement 7 jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Cette partie pourrait être optimisée avec une requête batch
    const orgsSnapshot = await db.collection('organizations').get();
    for (const orgDoc of orgsSnapshot.docs) {
      const oldLogsQuery = await db.collection('organizations')
        .doc(orgDoc.id)
        .collection('syncLogs')
        .where('timestamp', '<', sevenDaysAgo.toISOString())
        .get();
      
      // Supprimer les vieux logs
      const batch = db.batch();
      oldLogsQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      if (oldLogsQuery.docs.length > 0) {
        await batch.commit();
      }
    }
    
    aidsLogger.success(LogCategories.SYNC, 'Sync lite terminée', {
      accountsSynced: syncResults.length,
      results: syncResults
    });
    
    return NextResponse.json({
      success: true,
      message: 'Sync lite effectuée',
      accountsSynced: syncResults.length,
      nextSync: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // Dans 4h
    });
    
  } catch (error) {
    aidsLogger.critical(LogCategories.SYNC, 'Erreur critique sync lite', {
      errorMessage: error.message,
      errorStack: error.stack
    });
    
    return NextResponse.json({ 
      error: 'Erreur lors de la sync',
      details: error.message 
    }, { status: 500 });
  }
}

// GET pour vérifier le statut de la dernière sync
export async function GET(request) {
  try {
    // Récupérer les derniers logs de sync
    const orgsSnapshot = await db.collection('organizations').limit(1).get();
    
    if (orgsSnapshot.empty) {
      return NextResponse.json({
        success: true,
        lastSync: null,
        nextSync: null
      });
    }
    
    const orgDoc = orgsSnapshot.docs[0];
    const logsSnapshot = await db.collection('organizations')
      .doc(orgDoc.id)
      .collection('syncLogs')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();
    
    if (logsSnapshot.empty) {
      return NextResponse.json({
        success: true,
        lastSync: null,
        nextSync: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
      });
    }
    
    const lastLog = logsSnapshot.docs[0].data();
    const lastSyncTime = new Date(lastLog.timestamp);
    const nextSyncTime = new Date(lastSyncTime.getTime() + 4 * 60 * 60 * 1000);
    
    return NextResponse.json({
      success: true,
      lastSync: lastLog.timestamp,
      nextSync: nextSyncTime.toISOString(),
      lastSyncData: lastLog
    });
    
  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération du statut',
      details: error.message 
    }, { status: 500 });
  }
}