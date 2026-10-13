import { useCallback, useEffect, useState } from "react";

import {
  getRessourcesCours,
  type RessourceCours,
} from "../services/ressource.service";

import {
  getEvaluationsFormation,
  type EvaluationFormateur,
} from "../services/evaluation.service";

export function useCoursFormateur(coursId: string | undefined) {
  const [titreCours, setTitreCours] = useState("");
  const [titreFormation, setTitreFormation] = useState("");
  const [formationId, setFormationId] = useState("");
  const [ressources, setRessources] = useState<RessourceCours[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationFormateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const rechargerRessources = useCallback(async () => {
    if (!coursId) {
      return;
    }

    const data = await getRessourcesCours(coursId);

    setRessources(data.ressources);
  }, [coursId]);

  const rechargerEvaluations = useCallback(
    async (idFormation: string) => {
      if (!coursId) {
        return;
      }

      const toutesLesEvaluations = await getEvaluationsFormation(idFormation);

      setEvaluations(
        toutesLesEvaluations.filter(
          (evaluation) => evaluation.cours.id === coursId
        )
      );
    },
    [coursId]
  );

  useEffect(() => {
    async function chargerCours() {
      if (!coursId) {
        setLoading(false);
        return;
      }

      try {
        const dataRessources = await getRessourcesCours(coursId);

        setTitreCours(dataRessources.cours.titre);
        setTitreFormation(dataRessources.cours.formation.titre);
        setFormationId(dataRessources.cours.formation.id);
        setRessources(dataRessources.ressources);

        await rechargerEvaluations(dataRessources.cours.formation.id);
      } catch (err) {
        console.error(err);

        setError("Impossible de charger les informations du cours.");
      } finally {
        setLoading(false);
      }
    }

    chargerCours();
  }, [coursId, rechargerEvaluations]);

  return {
    titreCours,
    titreFormation,
    formationId,
    ressources,
    evaluations,
    loading,
    error,
    rechargerRessources,
    rechargerEvaluations,
  };
}