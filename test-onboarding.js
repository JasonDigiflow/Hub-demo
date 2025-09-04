import { chromium } from 'playwright';

async function testOnboarding() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Activer les logs de console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message);
  });

  try {
    console.log('🚀 Démarrage du test d\'onboarding...\n');

    // Étape 1: Aller sur la page d'inscription
    console.log('📍 Navigation vers /auth/register');
    await page.goto('http://localhost:3000/auth/register');
    await page.waitForLoadState('networkidle');
    
    // Capture d'écran initiale
    await page.screenshot({ path: 'test-step0-initial.png' });

    // ÉTAPE 1: Création du compte
    console.log('\n1️⃣ ÉTAPE 1: Création du compte');
    
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    await page.fill('input[name="firstName"]', 'Jean');
    await page.fill('input[name="lastName"]', 'Dupont');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.selectOption('select[name="locale"]', 'fr');
    await page.check('input[name="acceptTerms"]');
    
    console.log(`   ✓ Email: ${testEmail}`);
    await page.screenshot({ path: 'test-step1-filled.png' });
    
    // Cliquer sur Continuer
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // ÉTAPE 2: Entreprise
    console.log('\n2️⃣ ÉTAPE 2: Configuration entreprise');
    
    // Choisir "Créer une nouvelle organisation"
    await page.click('button:has-text("Créer une nouvelle organisation")');
    await page.waitForTimeout(1000);
    
    // Entrer le SIRET
    console.log('   📝 Saisie du SIRET: 90930058400010');
    await page.fill('input[placeholder*="SIRET"]', '90930058400010');
    
    // Cliquer sur Vérifier
    await page.click('button:has-text("Vérifier le SIRET")');
    console.log('   ⏳ Vérification du SIRET en cours...');
    
    // Attendre la réponse de l'API
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-step2-siret.png' });
    
    // Vérifier si les infos de l'entreprise sont affichées
    const companyInfo = await page.textContent('body');
    if (companyInfo.includes('DIGIFLOW AGENCY') || companyInfo.includes('90930058400010')) {
      console.log('   ✓ Entreprise trouvée et affichée');
    }
    
    // Cliquer sur Continuer
    const continueButton = await page.$('button:has-text("Continuer")');
    if (continueButton) {
      await continueButton.click();
      await page.waitForTimeout(2000);
    }

    // ÉTAPE 3: Modules & Abonnement
    console.log('\n3️⃣ ÉTAPE 3: Sélection des modules');
    
    // Sélectionner quelques modules
    const modules = ['ads-master', 'hubcrm'];
    for (const module of modules) {
      const moduleCard = await page.$(`[data-module="${module}"]`);
      if (moduleCard) {
        await moduleCard.click();
        console.log(`   ✓ Module sélectionné: ${module}`);
      }
    }
    
    await page.screenshot({ path: 'test-step3-modules.png' });
    
    // Sélectionner un plan
    const planButton = await page.$('button:has-text("Choisir Growth")');
    if (planButton) {
      await planButton.click();
      console.log('   ✓ Plan sélectionné: Growth');
    }
    
    await page.waitForTimeout(1000);
    
    // Continuer
    const nextButton = await page.$('button:has-text("Continuer")');
    if (nextButton) {
      await nextButton.click();
      await page.waitForTimeout(2000);
    }

    // ÉTAPE 4: Connexions
    console.log('\n4️⃣ ÉTAPE 4: Connexions');
    await page.screenshot({ path: 'test-step4-connections.png' });
    
    // Cliquer sur Terminer ou Passer
    const finishButton = await page.$('button:has-text("Terminer")');
    const skipButton = await page.$('button:has-text("Passer")');
    
    if (finishButton) {
      console.log('   🏁 Clic sur Terminer l\'inscription');
      await finishButton.click();
    } else if (skipButton) {
      console.log('   ⏭️ Clic sur Passer');
      await skipButton.click();
    }
    
    // Attendre la finalisation
    console.log('   ⏳ Finalisation de l\'inscription...');
    await page.waitForTimeout(5000);
    
    // Vérifier si on est redirigé vers le dashboard
    const currentUrl = page.url();
    console.log(`\n📍 URL actuelle: ${currentUrl}`);
    
    if (currentUrl.includes('/app/dashboard')) {
      console.log('✅ SUCCÈS: Redirection vers le dashboard!');
      await page.screenshot({ path: 'test-success-dashboard.png' });
    } else if (currentUrl.includes('/auth/login')) {
      console.log('⚠️ Redirigé vers login (compte peut-être déjà existant)');
    } else {
      console.log('❌ Pas de redirection - vérifier les erreurs');
      await page.screenshot({ path: 'test-error-final.png' });
    }

  } catch (error) {
    console.error('\n❌ ERREUR pendant le test:', error.message);
    await page.screenshot({ path: 'test-error.png' });
  } finally {
    console.log('\n📸 Screenshots sauvegardés dans le dossier du projet');
    await browser.close();
  }
}

// Lancer le test
testOnboarding().catch(console.error);