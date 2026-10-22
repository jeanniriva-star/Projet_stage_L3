import api from "../api/axios";
import type { NavigateFunction } from "react-router-dom";

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
      prix: string;
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

export interface MonInscription {
  id: string;
  statut: StatutInscription;
  dateInscription: string;

  formation: {
    id: string;
    titre: string;
    description: string | null;
    prix: string;
  };
}

export async function getMesInscriptions() {
  const response = await api.get<{ inscriptions: MonInscription[] }>(
    "/inscriptions/mes-inscriptions"
  );

  return response.data.inscriptions;
}

/**
 * Clic sur "S'inscrire" d'un apprenant connecté :
 *  - aucune inscription     -> on la crée, puis page de paiement
 *  - inscription en attente -> page de paiement
 *  - inscription validée    -> page de la formation
 *  - inscription refusée    -> message à afficher
 *
 * Renvoie un message à afficher si l'apprenant ne peut pas continuer,
 * sinon null (la navigation a déjà eu lieu).
 */
export async function demarrerInscription(
  formationId: string,
  navigate: NavigateFunction
): Promise<string | null> {
  const inscriptions = await getMesInscriptions();

  const existante = inscriptions.find(
    (inscription) => inscription.formation.id === formationId
  );

  if (existante?.statut === "VALIDEE") {
    navigate(`/apprenant/formations/${formationId}`);
    return null;
  }

  if (existante?.statut === "REFUSEE") {
    return "Votre demande d'inscription à cette formation a été refusée. Contactez le centre pour plus d'informations.";
  }

  const formation = existante
    ? existante.formation
    : (await inscrireFormation(formationId)).inscription.formation;

  navigate(`/inscription-en-attente?formationId=${formationId}`, {
    state: {
      formation: {
        id: formation.id,
        titre: formation.titre,
        prix: formation.prix,
      },
      ouvrirPaiement: true,
    },
  });

  return null;
}

export interface MonCertificat {
  id: string;
  numero: string;
  moyenne: number;
  delivreLe: string;

  inscription: {
    apprenant: {
      nom: string;
      prenom: string;
    };

    formation: {
      id: string;
      titre: string;
      type: "CONTINUE" | "PROFESSIONNELLE";
      niveau: string | null;
      termineeLe: string | null;
    };
  };
}

export async function getMesCertificats() {
  const response = await api.get<{ certificats: MonCertificat[] }>(
    "/inscriptions/mes-certificats"
  );

  return response.data.certificats;
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

