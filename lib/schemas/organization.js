import { z } from 'zod';

// ============= TYPES DE BASE =============

// Schéma pour les montants monétaires (toujours en centimes)
export const MonetarySchema = z.object({
  amountCents: z.number().int().min(0),
  currency: z.enum(['EUR', 'USD', 'GBP', 'CHF'])
});

// Schéma pour les timestamps
export const TimestampSchema = z.union([
  z.date(),
  z.string().transform(str => new Date(str)),
  z.object({ seconds: z.number(), nanoseconds: z.number() })
]);

// ============= ORGANIZATION =============

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  owner: z.string(), // uid du propriétaire
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
  subscription: z.object({
    plan: z.enum(['free', 'pro', 'enterprise']),
    status: z.enum(['active', 'canceled', 'past_due']),
    validUntil: TimestampSchema.optional()
  }).optional(),
  limits: z.object({
    maxMembers: z.number().default(5),
    maxAdAccounts: z.number().default(3),
    maxProspects: z.number().default(1000)
  }).optional()
});

export const MemberSchema = z.object({
  uid: z.string(),
  role: z.enum(['admin', 'member', 'viewer']),
  invitedBy: z.string(),
  createdAt: TimestampSchema,
  acceptedAt: TimestampSchema.optional(),
  email: z.string().email().optional()
});

// ============= AD ACCOUNTS =============

export const AdAccountSchema = z.object({
  id: z.string(),
  platform: z.enum(['meta', 'google', 'tiktok', 'linkedin']),
  externalId: z.string(), // ID dans la plateforme (ex: act_xxx pour Meta)
  name: z.string(),
  currency: z.enum(['EUR', 'USD', 'GBP', 'CHF']),
  status: z.enum(['active', 'paused', 'disabled', 'unsettled']),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
  credentials: z.object({
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
    expiresAt: TimestampSchema.optional()
  }).optional()
});

// ============= INSIGHTS =============

export const InsightDailySchema = z.object({
  date: TimestampSchema,
  spendCents: z.number().int().min(0),
  impressions: z.number().int().min(0),
  clicks: z.number().int().min(0),
  ctr: z.number().min(0).max(100), // En pourcentage
  cpcCents: z.number().int().min(0),
  cpmCents: z.number().int().min(0),
  conversions: z.number().int().min(0).optional(),
  conversionValue: z.number().min(0).optional(),
  roas: z.number().min(0).optional(),
  sourceWindow: z.enum(['1d', '7d', '28d']).default('1d')
});

// ============= CAMPAIGNS =============

export const CampaignSchema = z.object({
  id: z.string(),
  externalId: z.string(),
  name: z.string(),
  objective: z.enum([
    'awareness', 'traffic', 'engagement', 'leads', 
    'app_promotion', 'sales', 'conversions'
  ]),
  status: z.enum(['active', 'paused', 'deleted', 'archived']),
  budgetCents: z.number().int().min(0).optional(),
  budgetType: z.enum(['daily', 'lifetime']).optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
  startDate: TimestampSchema.optional(),
  endDate: TimestampSchema.optional()
});

// ============= PROSPECTS (pour AIDs) =============

export const ProspectSchema = z.object({
  id: z.string(),
  metaId: z.string().optional(), // Lead ID de Meta
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.enum(['meta', 'google', 'manual', 'import', 'api']),
  status: z.enum(['new', 'contacted', 'qualified', 'closing', 'converted', 'lost']),
  
  // Attribution
  campaignId: z.string().optional(),
  campaignName: z.string().optional(),
  adId: z.string().optional(),
  adName: z.string().optional(),
  formId: z.string().optional(),
  formName: z.string().optional(),
  
  // Données
  score: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  customFields: z.record(z.any()).optional(),
  
  // Revenue tracking
  revenueAmountCents: z.number().int().min(0).optional(),
  closingDate: TimestampSchema.optional(),
  
  // Timestamps
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
  contactedAt: TimestampSchema.optional(),
  qualifiedAt: TimestampSchema.optional(),
  convertedAt: TimestampSchema.optional()
});

// ============= REVENUES =============

export const RevenueSchema = z.object({
  id: z.string(),
  amountCents: z.number().int().min(0),
  currency: z.enum(['EUR', 'USD', 'GBP', 'CHF']),
  date: TimestampSchema,
  type: z.enum(['sale', 'subscription', 'commission', 'other']).default('sale'),
  attribution: z.object({
    campaignId: z.string().optional(),
    adId: z.string().optional(),
    prospectId: z.string().optional(),
    source: z.string().optional(),
    channel: z.string().optional()
  }).optional(),
  customer: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    email: z.string().email().optional()
  }).optional(),
  note: z.string().optional(),
  createdAt: TimestampSchema,
  createdBy: z.string() // uid de l'utilisateur
});

// ============= FONCTIONS UTILITAIRES =============

/**
 * Convertit un montant flottant en centimes
 */
export function toCents(amount) {
  return Math.round(amount * 100);
}

/**
 * Convertit des centimes en montant flottant
 */
export function fromCents(cents) {
  return cents / 100;
}

/**
 * Convertit une date en Timestamp Firestore
 */
export function toTimestamp(date) {
  if (!date) return new Date();
  if (typeof date === 'string') return new Date(date);
  if (date instanceof Date) return date;
  if (date.seconds) return new Date(date.seconds * 1000);
  return new Date();
}

/**
 * Génère un ID unique pour un document
 */
export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

/**
 * Valide et nettoie un prospect avant sauvegarde
 */
export function validateProspect(data) {
  try {
    // Convertir les dates si nécessaire
    if (data.createdAt && typeof data.createdAt === 'string') {
      data.createdAt = new Date(data.createdAt);
    }
    if (data.updatedAt && typeof data.updatedAt === 'string') {
      data.updatedAt = new Date(data.updatedAt);
    }
    
    // Ajouter les timestamps si manquants
    if (!data.createdAt) data.createdAt = new Date();
    if (!data.updatedAt) data.updatedAt = new Date();
    
    // Valider avec le schéma
    return ProspectSchema.parse(data);
  } catch (error) {
    console.error('Prospect validation error:', error);
    throw error;
  }
}

/**
 * Valide et nettoie des insights avant sauvegarde
 */
export function validateInsights(data) {
  try {
    // Convertir les montants en centimes
    if (data.spend !== undefined && data.spendCents === undefined) {
      data.spendCents = toCents(data.spend);
      delete data.spend;
    }
    if (data.cpc !== undefined && data.cpcCents === undefined) {
      data.cpcCents = toCents(data.cpc);
      delete data.cpc;
    }
    if (data.cpm !== undefined && data.cpmCents === undefined) {
      data.cpmCents = toCents(data.cpm);
      delete data.cpm;
    }
    
    // Convertir la date
    if (data.date && typeof data.date === 'string') {
      data.date = new Date(data.date);
    }
    
    return InsightDailySchema.parse(data);
  } catch (error) {
    console.error('Insights validation error:', error);
    throw error;
  }
}

/**
 * Valide et nettoie un revenue avant sauvegarde
 */
export function validateRevenue(data) {
  try {
    // Convertir le montant en centimes
    if (data.amount !== undefined && data.amountCents === undefined) {
      data.amountCents = toCents(data.amount);
      delete data.amount;
    }
    
    // Convertir la date
    if (data.date && typeof data.date === 'string') {
      data.date = new Date(data.date);
    }
    
    // Ajouter les timestamps
    if (!data.createdAt) data.createdAt = new Date();
    
    return RevenueSchema.parse(data);
  } catch (error) {
    console.error('Revenue validation error:', error);
    throw error;
  }
}