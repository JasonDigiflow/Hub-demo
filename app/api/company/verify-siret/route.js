import { NextResponse } from 'next/server';

// Mock API pour le développement - remplacer par Pappers en production
const MOCK_COMPANIES = {
  '73282932000074': {
    siren: '732829320',
    siret: '73282932000074',
    name: 'GOOGLE FRANCE SARL',
    address: '8 RUE DE LONDRES, 75009 PARIS',
    naf: '7311Z',
    status: 'active',
    establishments: [
      { siret: '73282932000074', type: 'Siège social', address: '8 RUE DE LONDRES, 75009 PARIS' }
    ]
  },
  '55208831700042': {
    siren: '552088317',
    siret: '55208831700042',
    name: 'FACEBOOK FRANCE SARL',
    address: '6 RUE MENARS, 75002 PARIS',
    naf: '7311Z',
    status: 'active',
    establishments: [
      { siret: '55208831700042', type: 'Siège social', address: '6 RUE MENARS, 75002 PARIS' }
    ]
  }
};

export async function POST(request) {
  try {
    const { siret } = await request.json();
    
    if (!siret) {
      return NextResponse.json(
        { error: 'SIRET requis' },
        { status: 400 }
      );
    }

    // Nettoyer le SIRET
    const cleanedSiret = siret.replace(/\s/g, '');
    
    // Validation du format
    if (!/^\d{14}$/.test(cleanedSiret)) {
      return NextResponse.json(
        { error: 'Le SIRET doit contenir 14 chiffres' },
        { status: 400 }
      );
    }

    // Appel RÉEL à l'API Pappers
    const pappersApiKey = process.env.PAPPERS_API_KEY;
    
    if (!pappersApiKey) {
      console.error('PAPPERS_API_KEY manquante dans les variables d\'environnement');
      // Fallback sur mock si pas de clé API
      const mockCompany = MOCK_COMPANIES[cleanedSiret];
      if (mockCompany) {
        return NextResponse.json({
          success: true,
          data: mockCompany,
          mock: true
        });
      }
      
      return NextResponse.json({
        success: true,
        data: {
          siren: cleanedSiret.slice(0, 9),
          siret: cleanedSiret,
          name: `Entreprise Test ${cleanedSiret.slice(0, 3)}`,
          address: '123 Rue de Test, 75001 PARIS',
          naf: '6201Z',
          status: 'active',
          establishments: [
            { 
              siret: cleanedSiret, 
              type: 'Siège social', 
              address: '123 Rue de Test, 75001 PARIS' 
            }
          ]
        },
        mock: true
      });
    }

    // VRAIE API PAPPERS
    const response = await fetch(
      `https://api.pappers.fr/v2/entreprise?siret=${cleanedSiret}&api_token=${pappersApiKey}`
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Entreprise non trouvée' },
          { status: 404 }
        );
      }
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Clé API Pappers invalide' },
          { status: 401 }
        );
      }
      throw new Error(`Pappers API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Formater la réponse
    return NextResponse.json({
      success: true,
      data: {
        siren: data.siren,
        siret: data.siege?.siret || cleanedSiret,
        name: data.nom_entreprise || data.denomination,
        address: `${data.siege?.adresse_ligne_1 || ''} ${data.siege?.code_postal || ''} ${data.siege?.ville || ''}`.trim(),
        naf: data.code_naf,
        status: data.statut_rcs || 'active',
        establishments: data.etablissements?.map(e => ({
          siret: e.siret,
          type: e.est_siege ? 'Siège social' : 'Établissement',
          address: `${e.adresse_ligne_1 || ''} ${e.code_postal || ''} ${e.ville || ''}`.trim()
        })) || [{
          siret: cleanedSiret,
          type: 'Siège social',
          address: `${data.siege?.adresse_ligne_1 || ''} ${data.siege?.code_postal || ''} ${data.siege?.ville || ''}`.trim()
        }]
      }
    });

  } catch (error) {
    console.error('Error verifying SIRET:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du SIRET' },
      { status: 500 }
    );
  }
}