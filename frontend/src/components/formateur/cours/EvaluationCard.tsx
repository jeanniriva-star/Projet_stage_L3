import { Link } from "react-router-dom";

import type { EvaluationFormateur } from "../../../services/evaluation.service";

type Props = {
  evaluation: EvaluationFormateur;
};

function EvaluationCard({ evaluation }: Props) {
  return (
    <article className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
          {evaluation.type}
        </p>

        <h3 className="mt-2 text-lg font-bold text-slate-900">
          {evaluation.titre}
        </h3>

        {evaluation.description && (
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {evaluation.description}
          </p>
        )}

        {evaluation._count && (
          <div className="mt-3 flex flex-wrap gap-5 text-sm text-slate-500">
            <span>
              {evaluation._count.questions} question
              {evaluation._count.questions > 1 ? "s" : ""}
            </span>

            <span>
              {evaluation._count.soumissions} soumission
              {evaluation._count.soumissions > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      <Link
        to={`/formateur/evaluations/${evaluation.id}`}
        className="shrink-0 rounded-xl border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Gérer l'évaluation
      </Link>
    </article>
  );
}

export default EvaluationCard;