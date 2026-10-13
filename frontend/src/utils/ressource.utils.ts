import type { RessourceCours } from "../services/ressource.service";

export const TAILLE_MAX_FICHIER = 20 * 1024 * 1024;

const EXTENSIONS_AUTORISEES = /\.(pdf|doc|docx|ppt|pptx)$/i;

export function estFichier(ressource: RessourceCours) {
  return ressource.url.startsWith("/uploads/ressources/");
}

/**
 * Retourne un message d'erreur, ou null si le fichier est valide.
 */
export function validerFichierRessource(fichier: File): string | null {
  if (fichier.size > TAILLE_MAX_FICHIER) {
    return "Le fichier ne doit pas dépasser 20 Mo.";
  }

  if (!EXTENSIONS_AUTORISEES.test(fichier.name)) {
    return "Seuls les fichiers PDF, Word et PowerPoint sont autorisés.";
  }

  return null;
}