// Mapping entre les valeurs frontend (kebab-case) et les enums Prisma (UPPER_SNAKE_CASE)

const activityTypeMap: Record<string, string> = {
  'action-created': 'ACTION_CREATED',
  'action-updated': 'ACTION_UPDATED',
  'action-deleted': 'ACTION_DELETED',
  'vote-created': 'VOTE_CREATED',
  'vote-deleted': 'VOTE_DELETED',
  'sujet-created': 'SUJET_CREATED',
  'sujet-deleted': 'SUJET_DELETED',
  'note-saved': 'NOTE_SAVED',
};

const activityTypeReverseMap: Record<string, string> = Object.fromEntries(
  Object.entries(activityTypeMap).map(([k, v]) => [v, k])
);

const actionStatutMap: Record<string, string> = {
  'en-cours': 'EN_COURS',
  'terminee': 'TERMINEE',
  'abandonnee': 'ABANDONNEE',
};

const actionStatutReverseMap: Record<string, string> = Object.fromEntries(
  Object.entries(actionStatutMap).map(([k, v]) => [v, k])
);

const comiteStatusMap: Record<string, string> = {
  'active': 'ACTIVE',
  'closed': 'CLOSED',
  'future': 'FUTURE',
};

const comiteStatusReverseMap: Record<string, string> = Object.fromEntries(
  Object.entries(comiteStatusMap).map(([k, v]) => [v, k])
);

export function toDbActivityType(frontendType: string): string {
  return activityTypeMap[frontendType] || frontendType;
}

export function toFrontendActivityType(dbType: string): string {
  return activityTypeReverseMap[dbType] || dbType;
}

export function toDbActionStatut(frontendStatut: string): string {
  return actionStatutMap[frontendStatut] || frontendStatut;
}

export function toFrontendActionStatut(dbStatut: string): string {
  return actionStatutReverseMap[dbStatut] || dbStatut;
}

export function toDbComiteStatus(frontendStatus: string): string {
  return comiteStatusMap[frontendStatus] || frontendStatus;
}

export function toFrontendComiteStatus(dbStatus: string): string {
  return comiteStatusReverseMap[dbStatus] || dbStatus;
}

// Transforme un objet action de la BDD vers le format frontend
export function formatActionForFrontend(action: any) {
  return {
    ...action,
    statut: toFrontendActionStatut(action.statut),
    echeance: action.echeance?.toISOString?.() || action.echeance,
    createdAt: action.createdAt?.toISOString?.() || action.createdAt,
  };
}

// Transforme un objet activité de la BDD vers le format frontend
export function formatActivityForFrontend(activity: any) {
  return {
    ...activity,
    type: toFrontendActivityType(activity.type),
    timestamp: activity.timestamp?.toISOString?.() || activity.timestamp,
  };
}

// Transforme un objet comité de la BDD vers le format frontend
export function formatComiteForFrontend(comite: any) {
  const result: any = {
    ...comite,
    status: toFrontendComiteStatus(comite.status),
    date: comite.date?.toISOString?.() || comite.date,
    startedAt: comite.startedAt?.toISOString?.() || comite.startedAt,
    endedAt: comite.endedAt?.toISOString?.() || comite.endedAt,
    createdAt: comite.createdAt?.toISOString?.() || comite.createdAt,
  };

  // Formater les relations imbriquées si présentes
  if (comite.activities) {
    result.activites = comite.activities.map(formatActivityForFrontend);
    delete result.activities;
  }
  if (comite.actions) {
    result.actions = comite.actions.map(formatActionForFrontend);
  }

  return result;
}
