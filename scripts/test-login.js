#!/usr/bin/env node

/**
 * Script pour tester la connexion avec un utilisateur Firestore
 */

const fetch = require('node-fetch');

async function testLogin(email, password) {
  console.log(`\n🔐 Test de connexion pour: ${email}`);
  console.log('================================\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('\n✅ Connexion réussie !');
      console.log('User ID:', data.user.id);
      console.log('User Name:', data.user.name);
      if (data.user.organization) {
        console.log('Organization:', data.user.organization.name);
      }
    } else {
      console.log('\n❌ Échec de la connexion');
      console.log('Erreur:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Récupérer les arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('Usage: node scripts/test-login.js <email> <password>');
  console.log('Example: node scripts/test-login.js test@example.com password123');
  process.exit(1);
}

const [email, password] = args;

// Tester la connexion
testLogin(email, password);