import api from "../api/axios";
import type {
  CreateUserAdminData,
  DeleteCheckResponse,
  MonProfil,
  UpdateProfilData,
  UserAdmin,
  UserRole,
  UsersResponse,
} from "../types/user.types";

// =====================================================
// ADMIN
// =====================================================

export async function getUsersAdmin(
  page = 1,
  limit = 10,
  search = "",
  role = "",
  formationId = ""
) {
  const response = await api.get<UsersResponse>("/users", {
    params: {
      page,
      limit,
      ...(search.trim() && { search: search.trim() }),
      ...(role && { role }),
      ...(formationId && { formationId }),
    },
  });

  return response.data;
}

export async function createUserAdmin(data: CreateUserAdminData) {
  const response = await api.post("/users", data);
  return response.data;
}

export async function getUserAdminById(userId: string) {
  const response = await api.get<{ user: UserAdmin }>(`/users/${userId}`);
  return response.data.user;
}

export async function updateUserRole(userId: string, role: UserRole) {
  const response = await api.patch(`/users/${userId}/role`, { role });
  return response.data;
}

export async function deleteUserAdmin(userId: string) {
  const response = await api.delete<{ message: string }>(`/users/${userId}`);
  return response.data;
}

export async function checkUserDeletionAdmin(userId: string) {
  const response = await api.get<DeleteCheckResponse>(
    `/users/${userId}/delete-check`
  );
  return response.data;
}

// =====================================================
// PROFIL
// =====================================================

export async function getMonProfil() {
  const response = await api.get<{ user: MonProfil }>("/users/me");
  return response.data.user;
}

export async function updateMonProfil(data: UpdateProfilData) {
  const response = await api.patch<{ message: string; user: MonProfil }>(
    "/users/me",
    data
  );
  return response.data;
}

export async function changerMotDePasse(
  ancienMotDePasse: string,
  nouveauMotDePasse: string
) {
  const response = await api.patch<{ message: string }>("/users/me/password", {
    ancienMotDePasse,
    nouveauMotDePasse,
  });
  return response.data;
}