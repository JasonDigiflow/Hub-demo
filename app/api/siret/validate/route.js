import { NextResponse } from 'next/server';

/**
 * Valide un numéro SIRET et génère les informations de l'entreprise
 * Pour l'instant, utilise des données simulées car les APIs gouvernementales sont instables
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const siret = searchParams.get('siret');
    
    if (!siret) {
      return NextResponse.json({ 
        success: false,
        error: 'SIRET manquant' 
      }, { status: 400 });
    }
    
    // Nettoyer le SIRET (enlever espaces et tirets)
    const cleanSiret = siret.replace(/[\s-]/g, '');
    
    // Vérifier le format (14 chiffres)
    if (!/^\d{14}$/.test(cleanSiret)) {
      return NextResponse.json({ 
        success: false,
        error: 'Format SIRET invalide (14 chiffres requis)',
        valid: false
      });
    }
    
    // Vérifier l'algorithme de Luhn pour le SIRET
    if (!isValidSiret(cleanSiret)) {
      return NextResponse.json({ 
        success: false,
        error: 'SIRET invalide (échec de la validation)',
        valid: false
      });
    }
    
    // Générer des données réalistes basées sur le SIRET
    const organizationData = generateOrganizationData(cleanSiret);
    
    return NextResponse.json({
      success: true,
      valid: true,
      message: 'SIRET valide',
      organization: organizationData
    });
    
  } catch (error) {
    console.error('Error validating SIRET:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Erreur lors de la validation du SIRET',
      details: error.message 
    }, { status: 500 });
  }
}

/**
 * Valide un SIRET avec l'algorithme de Luhn
 */
function isValidSiret(siret) {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(siret[i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/**
 * Génère des données d'organisation réalistes basées sur le SIRET
 */
function generateOrganizationData(siret) {
  const siren = siret.substring(0, 9);
  const nic = siret.substring(9, 14);
  
  // Générer un nom basé sur les premiers chiffres du SIREN
  const nameMap = {
    '909': { nom: 'DigiFlow Agency', commercial: 'DigiFlow', secteur: 'Services numériques' },
    '419': { nom: 'Tech Innovations SAS', commercial: 'Tech Innov', secteur: 'Technologies' },
    '443': { nom: 'Cloud Services France', commercial: 'Cloud Services', secteur: 'Services cloud' },
    '821': { nom: 'Web Agency Pro', commercial: 'WebPro', secteur: 'Agence web' },
    '552': { nom: 'Marketing Solutions', commercial: 'MarketSol', secteur: 'Marketing digital' },
    '732': { nom: 'Data Analytics Corp', commercial: 'DataCorp', secteur: 'Analyse de données' },
    '348': { nom: 'E-Commerce Partners', commercial: 'E-Partners', secteur: 'Commerce en ligne' },
    '890': { nom: 'Digital Transform', commercial: 'DigiTransform', secteur: 'Transformation digitale' }
  };
  
  const prefix = siren.substring(0, 3);
  const companyInfo = nameMap[prefix] || {
    nom: `Entreprise ${prefix}`,
    commercial: `Société ${prefix}`,
    secteur: 'Services aux entreprises'
  };
  
  // Générer une adresse basée sur le NIC
  const nicNum = parseInt(nic.substring(0, 2));
  const arrondissement = (nicNum % 20) + 1;
  const numeroRue = (nicNum * 3) % 200 || 1;
  
  const rues = [
    'Rue de la République', 'Avenue des Champs-Élysées', 'Boulevard Haussmann',
    'Rue du Commerce', "Avenue de l'Innovation", 'Place de la Bourse',
    'Rue Lafayette', 'Boulevard Voltaire', 'Avenue Victor Hugo'
  ];
  const rue = rues[nicNum % rues.length];
  
  // Générer code postal basé sur le département (2 premiers chiffres du NIC)
  let codePostal = '75001'; // Paris par défaut
  if (nicNum < 20) codePostal = `750${String(arrondissement).padStart(2, '0')}`;
  else if (nicNum < 40) codePostal = '69001'; // Lyon
  else if (nicNum < 60) codePostal = '13001'; // Marseille
  else if (nicNum < 80) codePostal = '33000'; // Bordeaux
  else codePostal = '31000'; // Toulouse
  
  // Déterminer la ville selon le code postal
  const ville = codePostal.startsWith('75') ? 'Paris' :
                codePostal.startsWith('69') ? 'Lyon' :
                codePostal.startsWith('13') ? 'Marseille' :
                codePostal.startsWith('33') ? 'Bordeaux' : 'Toulouse';
  
  // Générer effectif basé sur les chiffres du SIREN
  const effectifMap = ['1-9 salariés', '10-49 salariés', '50-249 salariés', '250-499 salariés'];
  const effectif = effectifMap[parseInt(siren[4]) % 4];
  
  // Codes NAF réalistes pour le digital
  const nafCodes = [
    { code: '6201Z', libelle: 'Programmation informatique' },
    { code: '6202A', libelle: 'Conseil en systèmes et logiciels informatiques' },
    { code: '7311Z', libelle: 'Activités des agences de publicité' },
    { code: '7021Z', libelle: 'Conseil en relations publiques et communication' },
    { code: '6312Z', libelle: 'Portails Internet' },
    { code: '7022Z', libelle: 'Conseil pour les affaires et autres conseils de gestion' }
  ];
  const naf = nafCodes[parseInt(siren[5]) % nafCodes.length];
  
  return {
    siret: siret,
    siren: siren,
    nom: companyInfo.nom,
    nomCommercial: companyInfo.commercial,
    adresse: `${numeroRue} ${rue}, ${codePostal} ${ville}`,
    codePostal: codePostal,
    ville: ville,
    pays: 'France',
    codeNaf: naf.code,
    libelleNaf: naf.libelle,
    formeJuridique: nicNum % 2 === 0 ? 'SAS' : 'SARL',
    effectif: effectif,
    dateCreation: `20${String(15 + (nicNum % 10)).padStart(2, '0')}-01-01`,
    status: 'Actif',
    secteur: companyInfo.secteur
  };
}