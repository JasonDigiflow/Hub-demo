/**
 * Utilitaires pour la validation et le formatage SIRET
 */

/**
 * Valide le format d'un SIRET (14 chiffres)
 */
export function validateSiretFormat(siret) {
  const cleaned = siret.replace(/\s/g, '');
  return /^\d{14}$/.test(cleaned);
}

/**
 * Formate un SIRET pour l'affichage (xxx xxx xxx xxxxx)
 */
export function formatSiret(siret) {
  const cleaned = siret.replace(/\s/g, '');
  if (cleaned.length !== 14) return siret;
  
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9, 14)}`;
}

/**
 * Extrait le SIREN d'un SIRET (9 premiers chiffres)
 */
export function extractSiren(siret) {
  const cleaned = siret.replace(/\s/g, '');
  return cleaned.slice(0, 9);
}

/**
 * Valide un SIRET avec l'algorithme de Luhn
 */
export function validateSiretLuhn(siret) {
  const cleaned = siret.replace(/\s/g, '');
  if (cleaned.length !== 14) return false;
  
  // Validation simplifiée pour le SIREN (9 premiers chiffres)
  const siren = cleaned.slice(0, 9);
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(siren[i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  
  return sum % 10 === 0;
}

/**
 * Masque d'entrée pour SIRET
 */
export function siretInputMask(value) {
  const cleaned = value.replace(/\D/g, '');
  const limited = cleaned.slice(0, 14);
  
  if (limited.length <= 3) return limited;
  if (limited.length <= 6) return `${limited.slice(0, 3)} ${limited.slice(3)}`;
  if (limited.length <= 9) return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
  return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6, 9)} ${limited.slice(9)}`;
}