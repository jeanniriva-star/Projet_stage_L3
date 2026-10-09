export type StatutSession = "NON_DEMARREE" | "EN_COURS" | "TERMINEE";

// =====================================================
// APPRENANT
// =====================================================

export interface SessionApprenant {
  id: string;
  titre: string;
  description: string | null;
  dateDebut: string;
  dateFin: string;
  statut: StatutSession;

  formation: {
    id: string;
    titre: string;
  };
}

export interface JoinSessionResponse {
  message: string;
  sessionId: string;
  titre: string;
  roomName: string;
  jitsiUrl: string;
  dateDebut: string;
  dateFin: string;
}

// =====================================================
// FORMATEUR
// =====================================================

export interface SessionFormateur {
  id: string;
  titre: string;
  description: string | null;
  dateDebut: string;
  dateFin: string;
  formationId: string;
  createdAt: string;
  statut: StatutSession;

  _count: {
    presences: number;
  };
}

export interface SessionAvecFormation extends SessionFormateur {
  formation: {
    id: string;
    titre: string;
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

export interface CreateSessionData {
  titre: string;
  description?: string;
  dateDebut: string;
  dateFin: string;
}

// =====================================================
// PRÉSENCES
// =====================================================

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