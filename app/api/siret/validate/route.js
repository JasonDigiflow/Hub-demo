import { NextResponse } from 'next/server';

/**
 * Valide un numéro SIRET et récupère les informations de l'entreprise
 * Utilise l'API gratuite entreprise.data.gouv.fr
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
    
    // Appeler l'API gouvernementale avec timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes timeout
    
    let response;
    try {
      response = await fetch(
        `https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/${cleanSiret}`,
        { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'DigiFlow-Hub/1.0'
          }
        }
      );
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      // En cas d'erreur réseau, retourner un mock pour le test
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          valid: true,
          message: 'SIRET valide (mode développement)',
          organization: {
            siret: cleanSiret,
            siren: cleanSiret.substring(0, 9),
            nom: 'Entreprise Test',
            nomCommercial: 'Test Company',
            adresse: '123 Rue du Test, 75001 Paris',
            codePostal: '75001',
            ville: 'Paris',
            pays: 'France',
            codeNaf: '6201Z',
            libelleNaf: 'Programmation informatique',
            formeJuridique: 'SARL',
            effectif: '10-49 salariés',
            dateCreation: '2020-01-01',
            status: 'Actif'
          }
        });
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ 
          success: false,
          error: 'SIRET non trouvé dans la base Sirene',
          valid: false
        });
      }
      
      if (response.status === 429) {
        return NextResponse.json({ 
          success: false,
          error: 'Trop de requêtes, veuillez réessayer',
          valid: false
        }, { status: 429 });
      }
      
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    const etablissement = data.etablissement;
    
    // Vérifier que l'établissement est actif
    const isActive = etablissement.etat_administratif === 'A';
    
    if (!isActive) {
      return NextResponse.json({ 
        success: false,
        error: 'Cet établissement est fermé',
        valid: false,
        data: {
          siret: etablissement.siret,
          nom: etablissement.unite_legale?.denomination || etablissement.denomination,
          status: 'Fermé',
          dateFermeture: etablissement.date_fermeture
        }
      });
    }
    
    // Construire le nom de l'entreprise
    const nom = etablissement.unite_legale?.denomination ||
                etablissement.unite_legale?.nom ||
                `${etablissement.unite_legale?.prenom_1} ${etablissement.unite_legale?.nom}` ||
                etablissement.denomination ||
                'Entreprise sans nom';
    
    // Construire l'adresse complète
    const adresse = [
      etablissement.numero_voie,
      etablissement.type_voie,
      etablissement.libelle_voie,
      etablissement.code_postal,
      etablissement.libelle_commune
    ].filter(Boolean).join(' ');
    
    // Données de l'organisation à créer
    const organizationData = {
      siret: etablissement.siret,
      siren: etablissement.siren,
      nom: nom.trim(),
      nomCommercial: etablissement.enseigne_1 || etablissement.denomination_usuelle || null,
      adresse: adresse,
      codePostal: etablissement.code_postal,
      ville: etablissement.libelle_commune,
      pays: 'France',
      codeNaf: etablissement.unite_legale?.activite_principale || etablissement.activite_principale,
      libelleNaf: etablissement.unite_legale?.activite_principale_libelle || null,
      formeJuridique: etablissement.unite_legale?.categorie_juridique || null,
      effectif: etablissement.tranche_effectifs || null,
      dateCreation: etablissement.date_creation,
      status: 'Actif'
    };
    
    return NextResponse.json({
      success: true,
      valid: true,
      message: 'SIRET valide et actif',
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