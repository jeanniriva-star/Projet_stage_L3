import api from "../api/axios";

export interface ExerciceCours {
  id: string;
  titre: string;
  description?: string | null;
  type: string;
  url: string;
  createdAt: string;
}

export async function getExercicesCours(coursId: string) {
  const response = await api.get<ExerciceCours[]>(`/cours/${coursId}/exercices`);
  return response.data;
}

export async function uploadExerciceFichier(
  coursId: string,
  fichier: File,
  titre?: string,
  description?: string
) {
  const formData = new FormData();
  formData.append("fichier", fichier, fichier.name);
  if (titre?.trim()) formData.append("titre", titre.trim());
  if (description?.trim()) formData.append("description", description.trim());

  const response = await api.post(`/cours/${coursId}/exercices`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function deleteExercice(exerciceId: string) {
  const response = await api.delete(`/exercices/${exerciceId}`);
  return response.data;
}

function obtenirNomDepuisDisposition(disposition: string | undefined) {
  if (!disposition) return undefined;
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }
  const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
  return filenameMatch?.[1];
}

export async function downloadExercice(exerciceId: string, nomFallback = "exercice.pdf") {
  const response = await api.get<Blob>(`/exercices/${exerciceId}/download`, {
    responseType: "blob",
  });

  const disposition = response.headers["content-disposition"];
  const nomFichier = obtenirNomDepuisDisposition(disposition) ?? nomFallback;

  const blobUrl = window.URL.createObjectURL(response.data);
  const lien = document.createElement("a");
  lien.href = blobUrl;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  window.URL.revokeObjectURL(blobUrl);
}