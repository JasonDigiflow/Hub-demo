// Temporary in-memory storage until Firebase is properly configured
// This will use localStorage in production for now

const COLLECTION_NAME = 'aids_prospects';

// Temporary implementation using in-memory storage
// Will be replaced with Firebase when properly configured

// In-memory storage
let prospectsStore = {};

// Helper to get storage key
function getStorageKey(userId) {
  return `${COLLECTION_NAME}_${userId}`;
}

// Créer ou mettre à jour un prospect
export async function saveProspect(prospect, userId) {
  try {
    const key = getStorageKey(userId);
    if (!prospectsStore[key]) {
      prospectsStore[key] = [];
    }
    
    const now = new Date().toISOString();
    
    if (prospect.id) {
      // Update existing
      const index = prospectsStore[key].findIndex(p => p.id === prospect.id);
      if (index >= 0) {
        prospectsStore[key][index] = {
          ...prospect,
          userId,
          updatedAt: now
        };
      } else {
        // Add new with existing ID
        prospectsStore[key].push({
          ...prospect,
          userId,
          createdAt: prospect.createdAt || now,
          updatedAt: now
        });
      }
      return prospect.id;
    } else {
      // Create new
      const newId = `PROS${Date.now()}`;
      prospectsStore[key].push({
        ...prospect,
        id: newId,
        userId,
        createdAt: now,
        updatedAt: now
      });
      return newId;
    }
  } catch (error) {
    console.error('Error saving prospect:', error);
    throw error;
  }
}

// Récupérer tous les prospects d'un utilisateur
export async function getProspects(userId) {
  try {
    const key = getStorageKey(userId);
    const prospects = prospectsStore[key] || [];
    
    // Sort by createdAt desc
    return prospects.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error getting prospects:', error);
    return [];
  }
}

// Supprimer un prospect
export async function deleteProspect(prospectId, userId) {
  try {
    const key = getStorageKey(userId);
    if (prospectsStore[key]) {
      prospectsStore[key] = prospectsStore[key].filter(p => p.id !== prospectId);
    }
  } catch (error) {
    console.error('Error deleting prospect:', error);
    throw error;
  }
}

// Sauvegarder plusieurs prospects en batch (pour l'import Meta)
export async function saveProspectsBatch(prospects, userId) {
  try {
    const promises = prospects.map(prospect => 
      saveProspect(prospect, userId)
    );
    
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Error saving prospects batch:', error);
    throw error;
  }
}

// Vérifier si des prospects existent déjà (par leurs IDs)
export async function checkExistingProspects(prospectIds, userId) {
  try {
    const key = getStorageKey(userId);
    const prospects = prospectsStore[key] || [];
    const existingIds = new Set();
    
    prospects.forEach(prospect => {
      if (prospectIds.includes(prospect.id)) {
        existingIds.add(prospect.id);
      }
    });
    
    return existingIds;
  } catch (error) {
    console.error('Error checking existing prospects:', error);
    return new Set();
  }
}