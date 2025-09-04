#!/usr/bin/env node

import fetch from 'node-fetch';

async function testFirebaseAPI() {
  console.log('🔍 Diagnostic de la configuration Firebase\n');
  console.log('═══════════════════════════════════════════════════════\n');

  // Configurations à tester
  const configs = [
    {
      name: 'Config actuelle (digiflowagency)',
      apiKey: 'AIzaSyDH1RYRN3KwYlYaFGf1Tw21nFkSmBZY1dE',
      projectId: 'digiflowagency'
    },
    {
      name: 'Config alternative (digiflow-hub)',  
      apiKey: 'AIzaSyDKL0IW2C6mYqcaHF5kxdgquO7t-s00plY',
      projectId: 'digiflow-hub'
    }
  ];

  for (const config of configs) {
    console.log(`\n📝 Test: ${config.name}`);
    console.log(`   Project ID: ${config.projectId}`);
    console.log(`   API Key: ${config.apiKey.substring(0, 10)}...`);
    
    // Test 1: Vérifier si l'API Key est valide
    console.log('\n   1. Test de validation de la clé API...');
    const validationUrl = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${config.apiKey}`;
    
    try {
      const response = await fetch(validationUrl);
      const data = await response.json();
      
      if (response.ok) {
        console.log('      ✅ Clé API valide');
        console.log(`      Project ID confirmé: ${data.projectId}`);
        if (data.authorizedDomains) {
          console.log(`      Domaines autorisés: ${data.authorizedDomains.join(', ')}`);
        }
      } else {
        console.log('      ❌ Clé API invalide');
        console.log(`      Erreur: ${data.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log('      ❌ Erreur de connexion:', error.message);
    }

    // Test 2: Tenter de créer un compte
    console.log('\n   2. Test de création de compte...');
    const signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${config.apiKey}`;
    
    try {
      const testEmail = `test${Date.now()}@example.com`;
      const response = await fetch(signUpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'TestPassword123!',
          returnSecureToken: true
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('      ✅ Création de compte réussie');
        console.log(`      Email: ${testEmail}`);
        console.log(`      UID: ${data.localId}`);
        
        // Supprimer le compte test
        if (data.idToken) {
          const deleteUrl = `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${config.apiKey}`;
          await fetch(deleteUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: data.idToken })
          });
          console.log('      🗑️ Compte test supprimé');
        }
      } else {
        console.log('      ❌ Impossible de créer un compte');
        console.log(`      Erreur: ${data.error?.message || 'Unknown error'}`);
        if (data.error?.errors) {
          data.error.errors.forEach(err => {
            console.log(`      - ${err.message} (${err.reason})`);
          });
        }
      }
    } catch (error) {
      console.log('      ❌ Erreur de connexion:', error.message);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('\n💡 Recommandations:\n');
  console.log('Si la clé API est invalide :');
  console.log('1. Allez sur https://console.firebase.google.com');
  console.log('2. Sélectionnez votre projet');
  console.log('3. Allez dans Paramètres du projet > Général');
  console.log('4. Copiez la configuration Web');
  console.log('');
  console.log('Si la création de compte échoue :');
  console.log('1. Allez dans Authentication > Sign-in method');
  console.log('2. Activez "Email/Password"');
  console.log('3. Vérifiez que votre domaine est autorisé');
  console.log('');
}

testFirebaseAPI().catch(console.error);