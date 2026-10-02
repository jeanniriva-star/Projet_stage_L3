import api from "../api/axios";

export type UserRole =
  | "ADMIN"
  | "FORMATEUR"
  | "APPRENANT";

export interface UserAdmin {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  utilisateurs: UserAdmin[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export async function getUsersAdmin(
  page = 1,
  limit = 10,
  search = "",
  role = ""
) {
  const response =
    await api.get<UsersResponse>(
      "/users",
      {
        params: {
          page,
          limit,

          ...(search.trim() && {
            search:
              search.trim(),
          }),

          ...(role && {
            role,
          }),
        },
      }
    );

  return response.data;
}

export interface CreateUserAdminData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone: string;
  adresse: string;

  role:
    | "ADMIN"
    | "FORMATEUR";
}

export async function createUserAdmin(
  data: CreateUserAdminData
) {
  const response =
    await api.post(
      "/users",
      data
    );

  return response.data;
}

export async function getUserAdminById(
  userId: string
) {
  const response =
    await api.get<{
      user: UserAdmin;
    }>(
      `/users/${userId}`
    );

  return response.data.user;
}

export async function updateUserRole(
  userId: string,
  role: UserRole
) {
  const response =
    await api.patch(
      `/users/${userId}/role`,
      {
        role,
      }
    );

  return response.data;
}

export async function deleteUserAdmin(
  userId: string
) {
  const response =
    await api.delete<{
      message: string;
    }>(
      `/users/${userId}`
    );

  return response.data;
}

export async function checkUserDeletionAdmin(
  userId: string
) {
  const response =
    await api.get<DeleteCheckResponse>(
      `/users/${userId}/delete-check`
    );

  return response.data;
}

export interface DeleteCheckApprenant {
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: "APPRENANT";
  };

  peutSupprimer: boolean;

  avertissement: string | null;

  dependances: {
    inscriptions: number;
    presences: number;
    progressions: number;
    soumissions: number;
  };

  details: {
    inscriptions: {
      id: string;
      statut:
        | "EN_ATTENTE"
        | "VALIDEE"
        | "REFUSEE";

      formation: {
        id: string;
        titre: string;
      };
    }[];
  };
}

export interface DeleteCheckFormateur {
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: "FORMATEUR";
  };

  peutSupprimer: boolean;

  avertissement: string | null;

  dependances: {
    affectations: number;
  };

  details: {
    affectations: {
      id: string;

      formation: {
        id: string;
        titre: string;
      };
    }[];
  };
}

export interface DeleteCheckAdmin {
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: "ADMIN";
  };

  peutSupprimer: boolean;

  raison: string | null;

  dependances: {
    formationsCreees: number;
  };

  details: {
    formationsCreees: {
      id: string;
      titre: string;
    }[];
  };
}

export type DeleteCheckResponse =
  | DeleteCheckApprenant
  | DeleteCheckFormateur
  | DeleteCheckAdmin;


  export interface MonProfil {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  role: UserRole;
  createdAt: string;
}

export async function getMonProfil() {
  const response = await api.get<{ user: MonProfil }>("/users/me");
  return response.data.user;
}

export interface UpdateProfilData {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
}

export async function updateMonProfil(data: UpdateProfilData) {
  const response = await api.patch<{ message: string; user: MonProfil }>("/users/me", data);
  return response.data;
}

export async function changerMotDePasse(ancienMotDePasse: string, nouveauMotDePasse: string) {
  const response = await api.patch<{ message: string }>("/users/me/password", {
    ancienMotDePasse,
    nouveauMotDePasse,
  });
  return response.data;
}