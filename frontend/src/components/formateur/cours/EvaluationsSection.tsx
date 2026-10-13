import { useState } from "react";

import { useEvaluationForm } from "../../../hooks/useEvaluationForm";
import type { EvaluationFormateur } from "../../../services/evaluation.service";
import EvaluationCard from "./EvaluationCard";
import EvaluationForm from "./EvaluationForm";

type Props = {
  coursId: string | undefined;
  formationId: string;
  evaluations: EvaluationFormateur[];
  rechargerEvaluations: (formationId: string) => Promise<void>;
};

function EvaluationsSection({
  coursId,
  formationId,
  evaluations,
  rechargerEvaluations,
}: Props) {
  const [showEvaluations, setShowEvaluations] = useState(true);

  const form = useEvaluationForm(coursId, formationId, rechargerEvaluations);

  return (
    <section className="mt-12 border-t border-slate-200 pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Évaluations</h2>

          <p className="mt-1 text-sm text-slate-500">
            QCM et autres évaluations associées au cours.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowEvaluations((current) => !current)}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
          >
            {showEvaluations ? "Masquer les QCM" : "Afficher les QCM"}
          </button>

          <button
            type="button"
            onClick={form.toggle}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            {form.visible ? "Fermer" : "Créer une évaluation"}
          </button>
        </div>
      </div>

      {form.visible && <EvaluationForm form={form} />}

      {showEvaluations &&
        (evaluations.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8">
            <p className="text-sm text-slate-600">
              Aucune évaluation créée pour ce cours.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {evaluations.map((evaluation) => (
              <EvaluationCard key={evaluation.id} evaluation={evaluation} />
            ))}
          </div>
        ))}
    </section>
  );
}

export default EvaluationsSection;