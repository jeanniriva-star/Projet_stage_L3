import api from "../api/axios";
import type { StatFormation } from "../components/admin/dashboard/StatsFormations";

export async function getStatistiquesAdmin() {
  const response = await api.get<{ statsFormations: StatFormation[] }>(
    "/dashboard/admin/statistiques"
  );

  return response.data.statsFormations;
}