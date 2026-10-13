import { useParams } from "react-router-dom";

import ExercicesSection from "../../components/ExercicesSection";
import CoursHeader from "../../components/formateur/cours/CoursHeader";
import EvaluationsSection from "../../components/formateur/cours/EvaluationsSection";
import RessourcesSection from "../../components/formateur/cours/RessourcesSection";
import { useCoursFormateur } from "../../hooks/useCoursFormateur";

function CoursFormateurPage() {
  const { coursId } = useParams();

  const {
    titreCours,
    titreFormation,
    formationId,
    ressources,
    evaluations,
    loading,
    error,
    rechargerRessources,
    rechargerEvaluations,
  } = useCoursFormateur(coursId);

  if (loading) {
    return <div className="p-8 text-slate-500">Chargement du cours...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <CoursHeader
          formationId={formationId}
          titreFormation={titreFormation}
          titreCours={titreCours}
          nbRessources={ressources.length}
          nbEvaluations={evaluations.length}
        />

        <RessourcesSection
          coursId={coursId}
          ressources={ressources}
          rechargerRessources={rechargerRessources}
        />

        <EvaluationsSection
          coursId={coursId}
          formationId={formationId}
          evaluations={evaluations}
          rechargerEvaluations={rechargerEvaluations}
        />

        {coursId && <ExercicesSection coursId={coursId} isFormateur />}
      </div>
    </div>
  );
}

export default CoursFormateurPage;