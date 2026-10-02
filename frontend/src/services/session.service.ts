import api from "../api/axios";

// ======================================================
// APPRENANT - SESSIONS
// ======================================================

export interface SessionApprenant {
  id: string;
  titre: string;
  description: string | null;
  dateDebut: string;
  dateFin: string;

  statut:
    | "NON_DEMARREE"
    | "EN_COURS"
    | "TERMINEE";

  formation: {
    id: string;
    titre: string;
  };
}

export async function getMesSessions() {
  const response = await api.get<{
    sessions: SessionApprenant[];
  }>("/sessions/mes-sessions");

  return response.data.sessions;
}

// ======================================================
// JOIN SESSION
// ======================================================

export interface JoinSessionResponse {
  message: string;
  sessionId: string;
  titre: string;
  roomName: string;
  jitsiUrl: string;
  dateDebut: string;
  dateFin: string;
}

// ======================================================
// FORMATEUR - SESSIONS
// ======================================================

export interface SessionFormateur {
  id: string;
  titre: string;
  description: string | null;
  dateDebut: string;
  dateFin: string;
  formationId: string;
  createdAt: string;

  statut:
    | "NON_DEMARREE"
    | "EN_COURS"
    | "TERMINEE";

  _count: {
    presences: number;
  };
}

export interface SessionsFormationResponse {
  formation: {
    id: string;
    titre: string;
  };

  sessions: SessionFormateur[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export async function getSessionsFormationFormateur(
  formationId: string
) {
  const response =
    await api.get<SessionsFormationResponse>(
      `/formations/${formationId}/sessions`
    );

  return response.data;
}

// ======================================================
// ACTIONS SESSION
// ======================================================

export interface SessionActionResponse {
  message?: string;
  url?: string;
  jitsiUrl?: string;
  roomName?: string;
  domain?: string;
  jwt?: string;
  moderator?: boolean;
  sessionId?: string;
  titre?: string;
  statut?: string;
  session?: SessionFormateur;
}

export async function demarrerSession(
  sessionId: string
) {
  const response =
    await api.post<SessionActionResponse>(
      `/sessions/${sessionId}/start`
    );

  return response.data;
}

export async function rejoindreSession(
  sessionId: string
) {
  const response =
    await api.post<SessionActionResponse>(
      `/sessions/${sessionId}/join`
    );

  return response.data;
}

export async function terminerSession(
  sessionId: string
) {
  const response =
    await api.post<SessionActionResponse>(
      `/sessions/${sessionId}/end`
    );

  return response.data;
}

// ======================================================
// CREATION SESSION
// ======================================================

export interface CreateSessionData {
  titre: string;
  description?: string;
  dateDebut: string;
  dateFin: string;
}

export async function creerSession(
  formationId: string,
  data: CreateSessionData
) {
  const response =
    await api.post(
      `/formations/${formationId}/sessions`,
      data
    );

  return response.data;
}

// ======================================================
// PRESENCES - FORMATEUR / ADMIN
// ======================================================

export interface PresenceApprenant {
  id: string;
  present: boolean;
  dateMarquage: string;

  inscription: {
    id: string;

    apprenant: {
      id: string;
      nom: string;
      prenom: string;
      email: string;
    };
  };
}

export interface PresencesSessionResponse {
  session: {
    id: string;
    titre: string;
    statut: "TERMINEE";
  };

  statistiques: {
    total: number;
    presents: number;
    absents: number;
  };

  presences: PresenceApprenant[];
}

export async function getPresencesSession(
  sessionId: string
) {
  const response =
    await api.get<PresencesSessionResponse>(
      `/sessions/${sessionId}/presences`
    );

  return response.data;
}

// ======================================================
// PRESENCE - APPRENANT
// ======================================================

export interface MaPresenceSessionResponse {
  session: {
    id: string;
    titre: string;
    statut: "TERMINEE";
  };

  maPresence: {
    present: boolean;
    dateMarquage: string | null;
  };
}

export async function getMaPresenceSession(
  sessionId: string
) {
  const response =
    await api.get<MaPresenceSessionResponse>(
      `/sessions/${sessionId}/presences`
    );

  return response.data;
}