import api from "../api/axios";
import type { CoursFormateur } from "../types/cours.types";

export async function getCoursFormation(formationId: string) {
  const response = await api.get(`/formations/${formationId}/cours`);

  return response.data;
}

export async function getMesCoursFormateur() {
  const response = await api.get<{ cours: CoursFormateur[] }>(
    "/cours/mes-cours"
  );

  return response.data.cours;
}