import api from "../api/axios";

export interface AdminDashboardData {
  utilisateurs: {
    total: number;
    formateurs: number;
    apprenants: number;
  };

  formations: number;

  inscriptions: {
    enAttente: number;
  };

  sessions: number;
  evaluations: number;
}

export async function getAdminDashboard() {
  const response = await api.get<{
    dashboard: AdminDashboardData;
  }>("/dashboard/admin");

  return response.data.dashboard;
}