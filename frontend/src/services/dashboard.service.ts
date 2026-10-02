import api from "../api/axios";

export interface DashboardFormateur {
  formations: number;
  apprenants: number;
  sessions: number;
  evaluations: number;

  prochainesSessions: {
    id: string;
    titre: string;
    dateDebut: string;
    dateFin: string;
    statut: "NON_DEMARREE" | "EN_COURS" | "TERMINEE";

    formation: {
      id: string;
      titre: string;
    };
  }[];
}

export async function getDashboardFormateur() {
  const response = await api.get<{
    dashboard: DashboardFormateur;
  }>("/dashboard/formateur");

  return response.data.dashboard;
}