import api from "../api/axios";

export type MethodePaiement = "MVOLA" | "ORANGE_MONEY" | "AIRTEL_MONEY";

export type StatutPaiement = "EN_ATTENTE" | "REUSSI" | "ECHOUE" | "ANNULE";

export interface Paiement {
  id: string;
  reference: string;
  montant: string;
  devise: string;
  methode: MethodePaiement;
  telephone: string;
  statut: StatutPaiement;
  motifEchec: string | null;
  expireAt: string;
  confirmeAt: string | null;
  createdAt: string;

  inscription: {
    id: string;
    statut: "EN_ATTENTE" | "VALIDEE" | "REFUSEE";

    formation: {
      id: string;
      titre: string;
    };
  };
}

export interface ReponsePaiement {
  paiement: Paiement;
  message: string;
  // Présent seulement en développement (simule le SMS reçu)
  codeSimulation?: string;
}

export async function initierPaiement(
  data: {
    formationId: string;
    methode: MethodePaiement;
    telephone: string;
  },
  cleIdempotence: string
) {
  const response = await api.post<ReponsePaiement>("/paiements", data, {
    headers: {
      "Idempotency-Key": cleIdempotence,
    },
  });

  return response.data;
}

export async function confirmerPaiement(paiementId: string, code: string) {
  const response = await api.post<ReponsePaiement>(
    `/paiements/${paiementId}/confirmer`,
    { code }
  );

  return response.data;
}

export async function getMesPaiements() {
  const response = await api.get<{ paiements: Paiement[] }>(
    "/paiements/mes-paiements"
  );

  return response.data.paiements;
}

// ======================================================
// ADMIN
// ======================================================

export interface PaiementAdmin {
  id: string;
  reference: string;
  montant: string;
  devise: string;
  methode: MethodePaiement;
  telephone: string;
  statut: StatutPaiement;
  motifEchec: string | null;
  createdAt: string;
  confirmeAt: string | null;

  inscription: {
    id: string;
    statut: "EN_ATTENTE" | "VALIDEE" | "REFUSEE";

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

export interface PaiementsAdminResponse {
  paiements: PaiementAdmin[];

  stats: {
    totalEncaisse: number;
    reussis: number;
    echoues: number;
    enAttente: number;
    annules: number;
  };

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export async function getPaiementsAdmin(params: {
  page?: number;
  limit?: number;
  search?: string;
  statut?: StatutPaiement;
  methode?: MethodePaiement;
}) {
  const { page = 1, limit = 10, search = "", statut, methode } = params;

  const response = await api.get<PaiementsAdminResponse>("/paiements", {
    params: {
      page,
      limit,

      ...(search.trim() && {
        search: search.trim(),
      }),

      ...(statut && {
        statut,
      }),

      ...(methode && {
        methode,
      }),
    },
  });

  return response.data;
}