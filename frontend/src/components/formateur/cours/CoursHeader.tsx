import { Link } from "react-router-dom";

type Props = {
  formationId: string;
  titreFormation: string;
  titreCours: string;
  nbRessources: number;
  nbEvaluations: number;
};

function CoursHeader({
  formationId,
  titreFormation,
  titreCours,
  nbRessources,
  nbEvaluations,
}: Props) {
  return (
    <>
      <Link
        to={`/formateur/formations/${formationId}`}
        className="text-sm font-semibold text-cyan-700 hover:text-cyan-900"
      >
        ← Retour à la formation
      </Link>

      <header className="mt-6 border-b border-slate-200 pb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
          {titreFormation}
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {titreCours}
        </h1>

        <p className="mt-2 text-slate-600">
          Gérez les ressources et les évaluations de ce cours.
        </p>

        <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-500">
          <span>
            {nbRessources} ressource{nbRessources > 1 ? "s" : ""}
          </span>

          <span>
            {nbEvaluations} évaluation{nbEvaluations > 1 ? "s" : ""}
          </span>
        </div>
      </header>
    </>
  );
}

export default CoursHeader;