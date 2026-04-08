// Système de gestion de session de comité - Version API
import { api } from '@/lib/api';

export interface Activity {
  type: 'action-created' | 'action-updated' | 'action-deleted' | 'vote-created' | 'vote-deleted' | 'sujet-created' | 'sujet-deleted' | 'note-saved';
  timestamp: string;
  description: string;
  details?: any;
}

// === Sync helpers (localStorage uniquement pour l'ID du comité actif) ===
const ACTIVE_COMITE_KEY = 'active-comite-id';

export const hasActiveSession = (): boolean => {
  return localStorage.getItem(ACTIVE_COMITE_KEY) !== null;
};

export const getActiveComiteId = (): string | null => {
  return localStorage.getItem(ACTIVE_COMITE_KEY);
};

const setActiveComiteId = (id: string | null) => {
  if (id) {
    localStorage.setItem(ACTIVE_COMITE_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_COMITE_KEY);
  }
};

// === Async API functions ===

// Démarrer une nouvelle session de comité
export const startComiteSession = async (formData: any, existingId?: string, agencyId?: string): Promise<string> => {
  if (existingId) {
    // Réouvrir un comité existant
    await api.reopenComite(existingId);
    await api.updateComite(existingId, { formData });
    setActiveComiteId(existingId);
    return existingId;
  } else {
    // Créer un nouveau comité
    const comite = await api.createComite({
      formData,
      date: formData.date || new Date().toISOString(),
      entite: formData.entite || 'Non renseigné',
      participants: formData.participants || 'Non renseigné',
      agencyId: agencyId || null,
    });
    setActiveComiteId(comite.id);
    return comite.id;
  }
};

// Récupérer la session courante (comité complet avec activités)
export const getCurrentSession = async (): Promise<any | null> => {
  const id = getActiveComiteId();
  if (!id) return null;
  try {
    return await api.getComiteFull(id);
  } catch {
    // Si le comité n'existe plus, nettoyer
    setActiveComiteId(null);
    return null;
  }
};

// Ajouter une activité à la session courante
export const addActivityToSession = async (activity: Omit<Activity, 'timestamp'>): Promise<void> => {
  const comiteId = getActiveComiteId();
  if (!comiteId) {
    console.warn('Aucune session de comité active');
    return;
  }
  await api.addActivity(comiteId, {
    type: activity.type,
    description: activity.description,
    details: activity.details || {},
  });
};

// Terminer la session et l'enregistrer
export const endComiteSession = async (): Promise<void> => {
  const id = getActiveComiteId();
  if (!id) {
    console.warn('Aucune session de comité à terminer');
    return;
  }
  await api.endComite(id);
  setActiveComiteId(null);
};

// Annuler la session courante (sans sauvegarder)
export const cancelCurrentSession = (): void => {
  setActiveComiteId(null);
};
