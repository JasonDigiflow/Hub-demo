import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * ⚠️ DANGER ZONE - Réinitialise complètement la base de données
 * À utiliser UNIQUEMENT en développement ou pour une remise à zéro complète
 */
export async function POST(request) {
  try {
    // Vérifier le secret pour éviter les suppressions accidentelles
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== 'reset-all-data-2024') {
      return NextResponse.json({ 
        error: 'Secret invalide. Utilisez ?secret=reset-all-data-2024' 
      }, { status: 403 });
    }
    
    console.log('🔥 DÉBUT DE LA RÉINITIALISATION COMPLÈTE...');
    
    const deletedStats = {
      users: 0,
      organizations: 0,
      aids_prospects: 0,
      aids_revenues: 0,
      test_tokens: 0,
      insights_cache: 0,
      audit_logs: 0,
      syncLogs: 0
    };
    
    // 1. Supprimer tous les utilisateurs
    console.log('Suppression des utilisateurs...');
    const usersSnapshot = await db.collection('users').get();
    for (const doc of usersSnapshot.docs) {
      await doc.ref.delete();
      deletedStats.users++;
    }
    
    // 2. Supprimer toutes les organisations et leurs sous-collections
    console.log('Suppression des organisations...');
    const orgsSnapshot = await db.collection('organizations').get();
    
    for (const orgDoc of orgsSnapshot.docs) {
      // Supprimer les sous-collections
      const syncLogsSnapshot = await db.collection('organizations')
        .doc(orgDoc.id)
        .collection('syncLogs')
        .get();
      
      if (!syncLogsSnapshot.empty) {
        for (const doc of syncLogsSnapshot.docs) {
          await doc.ref.delete();
          deletedStats.syncLogs++;
        }
      }
      
      // Supprimer l'organisation
      await orgDoc.ref.delete();
      deletedStats.organizations++;
    }
    
    // 3. Supprimer les prospects AIDs
    console.log('Suppression des prospects...');
    const prospectsSnapshot = await db.collection('aids_prospects').get();
    for (const doc of prospectsSnapshot.docs) {
      await doc.ref.delete();
      deletedStats.aids_prospects++;
    }
    
    // 4. Supprimer les revenus AIDs
    console.log('Suppression des revenus...');
    const revenuesSnapshot = await db.collection('aids_revenues').get();
    for (const doc of revenuesSnapshot.docs) {
      await doc.ref.delete();
      deletedStats.aids_revenues++;
    }
    
    // 5. Supprimer les test tokens
    console.log('Suppression des test tokens...');
    const tokensSnapshot = await db.collection('test_tokens').get();
    for (const doc of tokensSnapshot.docs) {
      await doc.ref.delete();
      deletedStats.test_tokens++;
    }
    
    // 6. Supprimer le cache insights
    console.log('Suppression du cache insights...');
    const cacheSnapshot = await db.collection('insights_cache').get();
    for (const doc of cacheSnapshot.docs) {
      await doc.ref.delete();
      deletedStats.insights_cache++;
    }
    
    // 7. Supprimer les audit logs
    console.log('Suppression des audit logs...');
    const logsSnapshot = await db.collection('audit_logs').get();
    for (const doc of logsSnapshot.docs) {
      await doc.ref.delete();
      deletedStats.audit_logs++;
    }
    
    console.log('✅ RÉINITIALISATION TERMINÉE');
    
    return NextResponse.json({
      success: true,
      message: 'Base de données réinitialisée avec succès',
      deleted: deletedStats,
      totalDeleted: Object.values(deletedStats).reduce((a, b) => a + b, 0)
    });
    
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la réinitialisation',
      details: error.message 
    }, { status: 500 });
  }
}

// GET pour voir les stats avant suppression
export async function GET() {
  try {
    const stats = {
      users: 0,
      organizations: 0,
      aids_prospects: 0,
      aids_revenues: 0,
      test_tokens: 0,
      insights_cache: 0,
      audit_logs: 0
    };
    
    // Compter les documents
    const [users, orgs, prospects, revenues, tokens, cache, logs] = await Promise.all([
      db.collection('users').get(),
      db.collection('organizations').get(),
      db.collection('aids_prospects').get(),
      db.collection('aids_revenues').get(),
      db.collection('test_tokens').get(),
      db.collection('insights_cache').get(),
      db.collection('audit_logs').get()
    ]);
    
    stats.users = users.size;
    stats.organizations = orgs.size;
    stats.aids_prospects = prospects.size;
    stats.aids_revenues = revenues.size;
    stats.test_tokens = tokens.size;
    stats.insights_cache = cache.size;
    stats.audit_logs = logs.size;
    
    return NextResponse.json({
      success: true,
      message: 'Statistiques actuelles de la base de données',
      stats,
      total: Object.values(stats).reduce((a, b) => a + b, 0),
      warning: 'Pour réinitialiser, faites un POST avec ?secret=reset-all-data-2024'
    });
    
  } catch (error) {
    console.error('Erreur lors de la lecture des stats:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la lecture des statistiques',
      details: error.message 
    }, { status: 500 });
  }
}