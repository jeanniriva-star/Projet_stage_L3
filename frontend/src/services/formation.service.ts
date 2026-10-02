import api from "../api/axios";

export interface Formation {
  id: string;
  titre: string;
  description: string | null;
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