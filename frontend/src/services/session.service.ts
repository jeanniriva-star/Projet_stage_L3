import api from "../api/axios";
import type {
  CreateSessionData,
  MaPresenceSessionResponse,
  PresencesSessionResponse,
  SessionActionResponse,
  SessionApprenant,
  SessionsFormationResponse,
} from "../types/session.types";

// =====================================================
// APPRENANT
// =====================================================

export async function getMesSessions() {
  const response = await api.get<{ sessions: SessionApprenant[] }>(
    "/sessions/mes-sessions"
  );

  return response.data.sessions;
}

export async function getMaPresenceSession(sessionId: string) {
  const response = await api.get<MaPresenceSessionResponse>(
    `/sessions/${sessionId}/presences`
  );

  return response.data;
}

// =====================================================
// FORMATEUR
// =====================================================

export async function getSessionsFormationFormateur(formationId: string) {
  const response = await api.get<SessionsFormationResponse>(
    `/formations/${formationId}/sessions`
  );

  return response.data;
}

export async function creerSession(
  formationId: string,
  data: CreateSessionData
) {
  const response = await api.post(`/formations/${formationId}/sessions`, data);

  return response.data;
}

// =====================================================
// ACTIONS SUR UNE SESSION
// =====================================================

export async function demarrerSession(sessionId: string) {
  const response = await api.post<SessionActionResponse>(
    `/sessions/${sessionId}/start`
  );

  return response.data;
}

export async function rejoindreSession(sessionId: string) {
  const response = await api.post<SessionActionResponse>(
    `/sessions/${sessionId}/join`
  );

  return response.data;
}

export async function terminerSession(sessionId: string) {
  const response = await api.post<SessionActionResponse>(
    `/sessions/${sessionId}/end`
  );

  return response.data;
}

// =====================================================
// PRÉSENCES (FORMATEUR / ADMIN)
// =====================================================

export async function getPresencesSession(sessionId: string) {
  const response = await api.get<PresencesSessionResponse>(
    `/sessions/${sessionId}/presences`
  );

  return response.data;
}