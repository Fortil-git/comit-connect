const rawApiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || '/api';
const API_BASE = rawApiBase.endsWith('/api')
  ? rawApiBase
  : rawApiBase.replace(/\/+$/, '') + '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: `Erreur ${res.status}` }));
    throw new Error(error.error || `Erreur API: ${res.status}`);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

export const api = {
  // === Agences ===
  getAgencies: () => request<any[]>('/agencies'),
  getAgency: (id: string) => request<any>(`/agencies/${id}`),

  // === Personnes ===
  getPersons: (search?: string) =>
    request<any[]>(`/persons${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  // === Comités ===
  getComites: (filters?: { status?: string; agencyId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.agencyId) params.set('agencyId', filters.agencyId);
    const query = params.toString();
    return request<any[]>(`/comites${query ? `?${query}` : ''}`);
  },
  getComite: (id: string) => request<any>(`/comites/${id}`),
  getComiteFull: (id: string) => request<any>(`/comites/${id}/full`),
  createComite: (data: any) =>
    request<any>('/comites', { method: 'POST', body: JSON.stringify(data) }),
  updateComite: (id: string, data: any) =>
    request<any>(`/comites/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  endComite: (id: string) =>
    request<any>(`/comites/${id}/end`, { method: 'PUT' }),
  reopenComite: (id: string) =>
    request<any>(`/comites/${id}/reopen`, { method: 'PUT' }),
  deleteComite: (id: string) =>
    request<void>(`/comites/${id}`, { method: 'DELETE' }),

  // === Activités ===
  getActivities: (comiteId: string) =>
    request<any[]>(`/comites/${comiteId}/activities`),
  getActivityCountsByTheme: (comiteId: string) =>
    request<Record<string, number>>(`/comites/${comiteId}/activities/count-by-theme`),
  getActivityCountsBySubTheme: (comiteId: string, themeId: string) =>
    request<Record<string, number>>(`/comites/${comiteId}/activities/count-by-subtheme?themeId=${themeId}`),
  addActivity: (comiteId: string, data: any) =>
    request<any>(`/comites/${comiteId}/activities`, { method: 'POST', body: JSON.stringify(data) }),

  // === Actions ===
  getActions: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters).toString();
    return request<any[]>(`/actions${params ? `?${params}` : ''}`);
  },
  getAction: (id: string) => request<any>(`/actions/${id}`),
  createAction: (data: any) =>
    request<any>('/actions', { method: 'POST', body: JSON.stringify(data) }),
  updateAction: (id: string, data: any) =>
    request<any>(`/actions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateActionStatut: (id: string, data: any) =>
    request<any>(`/actions/${id}/statut`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAction: (id: string) =>
    request<void>(`/actions/${id}`, { method: 'DELETE' }),

  // === Votes ===
  getVotes: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters).toString();
    return request<any[]>(`/votes${params ? `?${params}` : ''}`);
  },
  getVote: (id: string) => request<any>(`/votes/${id}`),
  createVote: (data: any) =>
    request<any>('/votes', { method: 'POST', body: JSON.stringify(data) }),
  castVote: (id: string, optionId: string) =>
    request<any>(`/votes/${id}/cast`, { method: 'PUT', body: JSON.stringify({ optionId }) }),
  deleteVote: (id: string) =>
    request<void>(`/votes/${id}`, { method: 'DELETE' }),

  // === Notes ===
  getNote: (params: { themeId: string; subThemeId: string; comiteId?: string }) => {
    const search = new URLSearchParams(params as any).toString();
    return request<any>(`/notes?${search}`);
  },
  getNotesByTheme: (params: { themeId: string; comiteId?: string }) => {
    const search = new URLSearchParams(params as any).toString();
    return request<Record<string, any>>(`/notes/by-theme?${search}`);
  },
  upsertNote: (data: any) =>
    request<any>('/notes', { method: 'POST', body: JSON.stringify(data) }),
  updateNote: (id: string, data: any) =>
    request<any>(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNote: (id: string) =>
    request<void>(`/notes/${id}`, { method: 'DELETE' }),
  addAttachment: (noteId: string, data: any) =>
    request<any>(`/notes/${noteId}/attachments`, { method: 'POST', body: JSON.stringify(data) }),
  deleteAttachment: (noteId: string, attachmentId: string) =>
    request<void>(`/notes/${noteId}/attachments/${attachmentId}`, { method: 'DELETE' }),

  // === Autres sujets ===
  getAutresSujets: (comiteId?: string) =>
    request<any[]>(`/autres-sujets${comiteId ? `?comiteId=${comiteId}` : ''}`),
  createAutreSujet: (data: any) =>
    request<any>('/autres-sujets', { method: 'POST', body: JSON.stringify(data) }),
  deleteAutreSujet: (id: string) =>
    request<void>(`/autres-sujets/${id}`, { method: 'DELETE' }),

  // === Exports ===
  getExports: (comiteId?: string) =>
    request<any[]>(`/exports${comiteId ? `?comiteId=${comiteId}` : ''}`),
  createExport: (data: any) =>
    request<any>('/exports', { method: 'POST', body: JSON.stringify(data) }),
  deleteExport: (id: string) =>
    request<void>(`/exports/${id}`, { method: 'DELETE' }),

  // === Thèmes (public) ===
  getThemes: () => request<any[]>('/themes'),

  // === Admin - Utilisateurs ===
  adminGetUsers: (filters?: { search?: string; role?: string; agencyId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.role) params.set('role', filters.role);
    if (filters?.agencyId) params.set('agencyId', filters.agencyId);
    const q = params.toString();
    return request<any[]>(`/admin/users${q ? `?${q}` : ''}`);
  },
  adminCreateUser: (data: any) =>
    request<any>('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateUser: (id: string, data: any) =>
    request<any>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteUser: (id: string) =>
    request<void>(`/admin/users/${id}`, { method: 'DELETE' }),
  adminToggleUserActive: (id: string) =>
    request<any>(`/admin/users/${id}/toggle-active`, { method: 'PUT' }),

  // === Admin - Thèmes ===
  adminGetThemes: () => request<any[]>('/admin/themes'),
  adminCreateTheme: (data: any) =>
    request<any>('/admin/themes', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateTheme: (id: string, data: any) =>
    request<any>(`/admin/themes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteTheme: (id: string) =>
    request<void>(`/admin/themes/${id}`, { method: 'DELETE' }),

  // === Admin - Sous-thèmes ===
  adminCreateSubTheme: (themeId: string, data: any) =>
    request<any>(`/admin/themes/${themeId}/sub-themes`, { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateSubTheme: (themeId: string, subThemeId: string, data: any) =>
    request<any>(`/admin/themes/${themeId}/sub-themes/${subThemeId}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteSubTheme: (themeId: string, subThemeId: string) =>
    request<void>(`/admin/themes/${themeId}/sub-themes/${subThemeId}`, { method: 'DELETE' }),
};
