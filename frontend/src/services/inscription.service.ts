import api from "../api/axios";

export type StatutInscription =
  | "EN_ATTENTE"
  | "VALIDEE"
  | "REFUSEE";

// ======================================================
// APPRENANT
// ======================================================

export interface InscriptionResponse {
  message: string;

  inscription: {
    id: string;
    statut: StatutInscription;
    dateInscription: string;

    formation: {
      id: string;
      titre: string;
      description: string | null;
    };
  };
}

export async function inscrireFormation(
  formationId: string
) {
  const response =
    await api.post<InscriptionResponse>(
      `/formations/${formationId}/inscriptions`
    );

  return response.data;
}

// ======================================================
// ADMIN - INSCRIPTIONS EN ATTENTE
// ======================================================

export interface InscriptionAdmin {
  id: string;
  statut: "EN_ATTENTE";
  dateInscription: string;

  apprenant: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  };

  formation: {
    id: string;
    titre: string;
    description: string | null;
  };
}

export interface InscriptionsEnAttenteResponse {
  inscriptions: InscriptionAdmin[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export async function getInscriptionsEnAttente(
  page = 1,
  limit = 10,
  search = ""
) {
  const response =
    await api.get<InscriptionsEnAttenteResponse>(
      "/inscriptions/en-attente",
      {
        params: {
          page,
          limit,

          ...(search.trim() && {
            search: search.trim(),
          }),
        },
      }
    );

  return response.data;
}

// ======================================================
// ADMIN - VALIDATION / REFUS
// ======================================================

export interface UpdateStatutInscriptionResponse {
  message: string;

  inscription: {
    id: string;
    statut:
      | "VALIDEE"
      | "REFUSEE";

    dateInscription: string;

    apprenant: {
      id: string;
      nom: string;
      prenom: string;
      email: string;
    };

    formation: {
      id: string;
      titre: string;
    };
  };
}

export async function updateStatutInscription(
  inscriptionId: string,
  statut:
    | "VALIDEE"
    | "REFUSEE"
) {
  const response =
    await api.patch<UpdateStatutInscriptionResponse>(
      `/inscriptions/${inscriptionId}/statut`,
      {
        statut,
      }
    );

  return response.data;
}