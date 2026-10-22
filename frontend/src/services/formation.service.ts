import api from "../api/axios";
export type TypeFormation = "CONTINUE" | "PROFESSIONNELLE";
export type NiveauUniversitaire = "L1" | "L2" | "L3" | "M1" | "M2";
export type StatutFormation = "EN_COURS" | "TERMINEE";

export interface Formation {
  id: string;
  titre: string;
  description: string | null;
  prix: string, 
  type: TypeFormation;
  niveau: NiveauUniversitaire | null;
  statut: StatutFormation;
  termineeLe: string | null;
  createdAt: string;
  updatedAt: string;

  createur: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };

  _count: {
    cours: number;
    sessions: number;
    affectations: number;
    inscriptions: number;
  };
}

export interface FormationListResponse {
  formations: Formation[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export async function getFormations(
  page = 1,
  limit = 12,
  search = ""
) {
  const response =
    await api.get<FormationListResponse>(
      "/formations",
      {
        params: {
          page,
          limit,
          ...(search && { search }),
        },
      }
    );

  return response.data;
}

export async function getFormationById(id: string) {
  const response = await api.get<{ formation: Formation }>(
    `/formations/${id}`
  );

  return response.data.formation;
}

export interface FormationAdmin {
  id: string;
  titre: string;
  description: string | null;
  prix: string,
  type: TypeFormation;
  niveau: NiveauUniversitaire | null;
  statut: StatutFormation;
  termineeLe: string | null;
  createdAt: string;
  updatedAt: string;

  createur: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };

  _count: {
    cours: number;
    sessions: number;
    affectations: number;
    inscriptions: number;
  };
}

export interface FormationsAdminResponse {
  formations: FormationAdmin[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export async function getFormationsAdmin(
  page = 1,
  limit = 10,
  search = ""
) {
  const response =
    await api.get<FormationsAdminResponse>(
      "/formations",
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

export async function createFormationAdmin(
  data: {
    titre: string;
    description?: string;
    prix: number;
    type: TypeFormation;
    niveau?: NiveauUniversitaire | null;
  }
) {
  const response =
    await api.post(
      "/formations",
      data
    );

  return response.data;
}

export async function updateFormationAdmin(
  formationId: string,
  data: {
    titre?: string;
    description?: string | null;
    prix?: number;
    type?: TypeFormation;
    niveau?: NiveauUniversitaire | null;
  }
) {
  const response =
    await api.patch(
      `/formations/${formationId}`,
      data
    );

  return response.data;
}

export async function deleteFormationAdmin(
  formationId: string
) {
  const response =
    await api.delete<{
      message: string;
    }>(
      `/formations/${formationId}`
    );

  return response.data;
}

export interface FormationDetailAdmin {
  id: string;
  titre: string;
  description: string | null;
  prix: string,
  type: TypeFormation;
  niveau: NiveauUniversitaire | null;
  statut: StatutFormation;
  termineeLe: string | null;
  createdAt: string;
  updatedAt: string;

  createur: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };

  _count: {
    cours: number;
    sessions: number;
    affectations: number;
    inscriptions: number;
  };
}

export async function getFormationDetailAdmin(
  formationId: string
) {
  const response =
    await api.get<{
      formation: FormationDetailAdmin;
    }>(
      `/formations/${formationId}`
    );

  return response.data.formation;
}

// ======================================================
// FIN DE FORMATION ET CERTIFICATS (ADMIN)
// ======================================================

export interface ResultatApprenantFin {
  inscriptionId: string;

  apprenant: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };

  nombreQcm: number;
  moyenne: number | null;
  reussi: boolean;
  aDejaCertificat: boolean;
}

export interface ApercuFinFormation {
  formation: {
    id: string;
    titre: string;
    statut: StatutFormation;
    termineeLe: string | null;
  };

  seuil: number;
  eligibles: ResultatApprenantFin[];
  nonEligibles: ResultatApprenantFin[];
}

export async function getApercuFinFormation(
  formationId: string
) {
  const response =
    await api.get<ApercuFinFormation>(
      `/formations/${formationId}/fin/apercu`
    );

  return response.data;
}

export interface ResultatFinFormation {
  message: string;

  formation: {
    id: string;
    titre: string;
    statut: StatutFormation;
    termineeLe: string | null;
  };

  nombreApprenants: number;
  certificatsDelivres: number;
}

export async function terminerFormationAdmin(
  formationId: string
) {
  const response =
    await api.post<ResultatFinFormation>(
      `/formations/${formationId}/terminer`
    );

  return response.data;
}