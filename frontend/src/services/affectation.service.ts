import api from "../api/axios";

export interface FormationAffectee {
  id: string;

  formation: {
    id: string;
    titre: string;
    description: string | null;
    createdAt: string;

    _count: {
      cours: number;
      sessions: number;
      inscriptions: number;
    };
  };
}

export async function getMesFormationsFormateur() {
  const response = await api.get<{
    affectations: FormationAffectee[];
  }>("/affectations/mes-formations");

  return response.data.affectations;
}

export interface AffectationAdmin {
  id: string;
  formationId: string;
  formateurId: string;

  formateur: {
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

export interface AffectationsResponse {
  affectations: AffectationAdmin[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export async function getAffectationsAdmin(
  page = 1,
  limit = 10,
  search = ""
) {
  const response =
    await api.get<AffectationsResponse>(
      "/affectations",
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

export interface CreateAffectationData {
  formationId: string;
  formateurId: string;
}

export async function createAffectationAdmin(
  data: CreateAffectationData
) {
  const response =
    await api.post(
      "/affectations",
      data
    );

  return response.data;
}

export async function deleteAffectationAdmin(
  affectationId: string
) {
  const response =
    await api.delete<{
      message: string;
    }>(
      `/affectations/${affectationId}`
    );

  return response.data;
}