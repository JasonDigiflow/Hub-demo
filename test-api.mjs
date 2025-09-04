#!/usr/bin/env node

// Test du processus d'inscription via les APIs
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testRegistrationFlow() {
  console.log('🧪 Test du processus d\'inscription via les APIs\n');
  console.log('═══════════════════════════════════════════════════════\n');

  // 1. Test de l'API de vérification SIRET
  console.log('1️⃣ Test de l\'API de vérification SIRET...');
  
  const siretResponse = await fetch(`${BASE_URL}/api/company/verify-siret`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ siret: '90930058400010' })
  });
  
  const siretData = await siretResponse.json();
  
  if (siretData.success) {
    console.log('   ✅ SIRET vérifié avec succès');
    console.log(`   Entreprise: ${siretData.data.name}`);
    console.log(`   Adresse: ${siretData.data.address}`);
    console.log(`   NAF: ${siretData.data.naf}`);
  } else {
    console.log('   ❌ Erreur de vérification SIRET');
  }

  // 2. Test de l'API check-exists
  console.log('\n2️⃣ Test de l\'API check-exists...');
  
  const checkResponse = await fetch(`${BASE_URL}/api/company/check-exists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ siret: '90930058400010' })
  });
  
  const checkData = await checkResponse.json();
  console.log(`   Existe: ${checkData.exists}`);
  console.log(`   Mock: ${checkData.mock}`);

  // 3. Afficher les URLs importantes
  console.log('\n3️⃣ URLs à tester manuellement:');
  console.log(`   • Page d'inscription: ${BASE_URL}/auth/register`);
  console.log(`   • Test Firebase: ${BASE_URL}/test-firebase.html`);
  console.log(`   • Test navigateur: ${BASE_URL}/test-browser.html`);
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📝 Pour tester manuellement le processus complet:');
  console.log('');
  console.log('1. Aller sur http://localhost:3000/auth/register');
  console.log('2. Étape 1 - Remplir le formulaire:');
  console.log('   • Prénom: Jean');
  console.log('   • Nom: Dupont');
  console.log('   • Email: test@example.com');
  console.log('   • Mot de passe: Password123!');
  console.log('   • Cocher les conditions');
  console.log('');
  console.log('3. Étape 2 - Entreprise:');
  console.log('   • Choisir "Créer une nouvelle organisation"');
  console.log('   • SIRET: 90930058400010');
  console.log('   • Cliquer sur "Vérifier"');
  console.log('');
  console.log('4. Étape 3 - Modules:');
  console.log('   • Sélectionner des modules');
  console.log('   • Choisir un plan');
  console.log('');
  console.log('5. Étape 4 - Connexions:');
  console.log('   • Cliquer sur "Passer" ou "Terminer"');
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
}

testRegistrationFlow().catch(console.error);