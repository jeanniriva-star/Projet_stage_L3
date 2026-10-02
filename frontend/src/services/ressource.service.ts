import api from "../api/axios";

export interface RessourceCours {
  id: string;
  nom: string;
  type: string;
  url: string;
  coursId: string;
  createdAt: string;
}

export interface RessourcesCoursResponse {
  cours: {
    id: string;
    titre: string;

    formation: {
      id: string;
      titre: string;
    };
  };

  statistiques: {
    total: number;
    parType: Record<string, number>;
  };

  ressources: RessourceCours[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export async function getRessourcesCours(
  coursId: string
) {
  const response =
    await api.get<RessourcesCoursResponse>(
      `/cours/${coursId}/ressources`,
      {
        params: {
          page: 1,
          limit: 100,
        },
      }
    );

  return response.data;
}

// ======================================================
// VIDEO / LIEN
// ======================================================

export interface CreateRessourceData {
  nom: string;
  type: "VIDEO" | "LIEN";
  url: string;
}

export async function createRessource(
  coursId: string,
  data: CreateRessourceData
) {
  const response =
    await api.post(
      `/cours/${coursId}/ressources`,
      data
    );

  return response.data;
}

// ======================================================
// UPLOAD FICHIER
// ======================================================

export async function uploadRessourceFichier(
  coursId: string,
  fichier: File,
  nom?: string
) {
  const formData = new FormData();

  formData.append(
    "fichier",
    fichier,
    fichier.name
  );

  if (
    nom &&
    nom.trim() !== ""
  ) {
    formData.append(
      "nom",
      nom.trim()
    );
  }

  const response = await api.post(
    `/cours/${coursId}/ressources/upload`,
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
}

// ======================================================
// MODIFICATION
// ======================================================

export interface UpdateRessourceData {
  nom?: string;
  type?: string;
  url?: string;
}

export async function updateRessource(
  ressourceId: string,
  data: UpdateRessourceData
) {
  const response =
    await api.patch(
      `/ressources/${ressourceId}`,
      data
    );

  return response.data;
}

// ======================================================
// SUPPRESSION
// ======================================================

export async function deleteRessource(
  ressourceId: string
) {
  const response =
    await api.delete(
      `/ressources/${ressourceId}`
    );

  return response.data;
}

// ======================================================
// TELECHARGEMENT SECURISE
// ======================================================

function obtenirNomDepuisDisposition(
  disposition: string | undefined
) {
  if (!disposition) {
    return undefined;
  }

  /*
   * Exemple :
   * filename*=UTF-8''Cours%20React.pdf
   */
  const utf8Match =
    disposition.match(
      /filename\*=UTF-8''([^;]+)/i
    );

  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(
        utf8Match[1]
      );
    } catch {
      return utf8Match[1];
    }
  }

  /*
   * Exemple :
   * filename="Cours React.pdf"
   */
  const filenameMatch =
    disposition.match(
      /filename="?([^";]+)"?/i
    );

  return filenameMatch?.[1];
}

export async function downloadRessource(
  ressourceId: string,
  nomFallback = "ressource"
) {
  const response =
    await api.get<Blob>(
      `/ressources/${ressourceId}/download`,
      {
        responseType: "blob",
      }
    );

  const disposition =
    response.headers[
      "content-disposition"
    ];

  const nomFichier =
    obtenirNomDepuisDisposition(
      disposition
    ) ?? nomFallback;

  const blobUrl =
    window.URL.createObjectURL(
      response.data
    );

  const lien =
    document.createElement("a");

  lien.href =
    blobUrl;

  lien.download =
    nomFichier;

  document.body.appendChild(
    lien
  );

  lien.click();
  lien.remove();

  window.URL.revokeObjectURL(
    blobUrl
  );
}