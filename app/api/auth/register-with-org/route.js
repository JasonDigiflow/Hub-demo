import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { name, email, password, organization } = await request.json();
    
    // Validation des données
    if (!name || !email || !password || !organization) {
      return NextResponse.json({
        success: false,
        error: 'Données manquantes'
      }, { status: 400 });
    }
    
    // Vérifier que l'email n'existe pas déjà
    const existingUser = await db.collection('users')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();
    
    if (!existingUser.empty) {
      return NextResponse.json({
        success: false,
        error: 'Un compte existe déjà avec cet email'
      }, { status: 400 });
    }
    
    // Vérifier que le SIRET n'est pas déjà utilisé
    const existingOrg = await db.collection('organizations')
      .where('siret', '==', organization.siret)
      .limit(1)
      .get();
    
    if (!existingOrg.empty) {
      return NextResponse.json({
        success: false,
        error: 'Une organisation existe déjà avec ce SIRET'
      }, { status: 400 });
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer l'ID utilisateur
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orgId = `org_${organization.siret}`;
    
    // Créer l'organisation (filtrer les undefined)
    const orgData = {
      id: orgId,
      siret: organization.siret,
      siren: organization.siren,
      name: organization.nom,
      address: organization.adresse,
      postalCode: organization.codePostal,
      city: organization.ville,
      country: organization.pays || 'France',
      status: organization.status || 'Actif',
      owner: userId,
      members: [userId],
      adAccounts: [], // Sera rempli lors de la connexion Meta
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Ajouter les champs optionnels s'ils existent
    if (organization.nomCommercial) orgData.commercialName = organization.nomCommercial;
    if (organization.codeNaf) orgData.nafCode = organization.codeNaf;
    if (organization.libelleNaf) orgData.nafLabel = organization.libelleNaf;
    if (organization.formeJuridique) orgData.legalForm = organization.formeJuridique;
    if (organization.effectif) orgData.workforce = organization.effectif;
    if (organization.dateCreation) orgData.creationDate = organization.dateCreation;
    
    console.log('Creating organization:', orgData);
    
    try {
      await db.collection('organizations').doc(orgId).set(orgData);
      console.log('Organization created successfully');
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
    
    // Créer l'utilisateur
    const userData = {
      uid: userId,
      email: email.toLowerCase(),
      name: name,
      password: hashedPassword,
      role: 'owner', // Propriétaire de l'organisation
      primaryOrgId: orgId,
      orgIds: [orgId],
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Creating user:', { ...userData, password: '***' });
    
    try {
      await db.collection('users').doc(userId).set(userData);
      console.log('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      // Rollback: supprimer l'organisation si l'utilisateur n'a pas pu être créé
      try {
        await db.collection('organizations').doc(orgId).delete();
        console.log('Rolled back organization creation');
      } catch (rollbackError) {
        console.error('Error rolling back:', rollbackError);
      }
      throw error;
    }
    
    // Créer le token JWT
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    const token = jwt.sign(
      {
        uid: userId,
        email: userData.email,
        name: userData.name,
        orgId: orgId,
        role: 'owner'
      },
      jwtSecret,
      { expiresIn: '30d' }
    );
    
    // Définir le cookie d'authentification
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 jours
    });
    
    // Log de création
    await db.collection('audit_logs').add({
      action: 'user_registration_with_org',
      userId: userId,
      orgId: orgId,
      email: email,
      siret: organization.siret,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });
    
    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      user: {
        uid: userId,
        email: userData.email,
        name: userData.name,
        orgId: orgId
      },
      organization: {
        id: orgId,
        name: organization.nom,
        siret: organization.siret
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création du compte',
      details: error.message
    }, { status: 500 });
  }
}