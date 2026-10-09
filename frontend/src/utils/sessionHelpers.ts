import type { SessionAvecFormation } from "../types/session.types";
import { toLocalDateKey } from "./dates";

export interface FiltresHistorique {
  recherche: string;
  formationId: string;
  date: string;
}

export function separerSessions(sessions: SessionAvecFormation[]) {
  const actives = sessions.filter((s) => s.statut !== "TERMINEE");

  const terminees = sessions
    .filter((s) => s.statut === "TERMINEE")
    .sort(
      (a, b) =>
        new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime()
    );

  return { actives, terminees };
}

export function filtrerHistorique(
  sessions: SessionAvecFormation[],
  filtres: FiltresHistorique
) {
  const recherche = filtres.recherche.trim().toLowerCase();

  return sessions.filter((session) => {
    const correspondRecherche =
      !recherche ||
      session.titre.toLowerCase().includes(recherche) ||
      session.formation.titre.toLowerCase().includes(recherche);

    const correspondFormation =
      !filtres.formationId || session.formation.id === filtres.formationId;

    const correspondDate =
      !filtres.date || toLocalDateKey(session.dateDebut) === filtres.date;

    return correspondRecherche && correspondFormation && correspondDate;
  });
}

export const FILTRES_VIDES: FiltresHistorique = {
  recherche: "",
  formationId: "",
  date: "",
};