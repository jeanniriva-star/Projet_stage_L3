import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getMesEvaluations,
  type EvaluationApprenant,
} from "../../services/evaluation.service";

function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<EvaluationApprenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function chargerEvaluations() {
      try {
        const data = await getMesEvaluations();
        setEvaluations(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger vos évaluations.");
      } finally {
        setLoading(false);
      }
    }

    chargerEvaluations();
  }, []);

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Espace apprenant
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Mes évaluations
          </h1>

          <p className="mt-2 text-slate-600">
            Consultez les évaluations disponibles pour vos formations.
          </p>
        </div>

        {loading && (
          <p className="text-slate-500">
            Chargement des évaluations...
          </p>
        )}

        {error && (
          <p className="text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && evaluations.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-600">
              Aucune évaluation disponible pour le moment.
            </p>
          </div>
        )}

        {!loading && !error && evaluations.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {evaluations.map((evaluation) => {
              const dejaSoumis = evaluation.soumissions.length > 0;

              return (
                <article
                  key={evaluation.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                    {evaluation.cours.formation.titre}
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    {evaluation.titre}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {evaluation.cours.titre}
                  </p>

                  {evaluation.description && (
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {evaluation.description}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                      {evaluation.type}
                    </div>

                    {dejaSoumis && (
                      <span className="text-sm font-medium text-slate-500">
                        Déjà soumis
                      </span>
                    )}
                  </div>

                  <div className="mt-5">
                    {dejaSoumis ? (
                      <Link
                        to="/apprenant/resultats"
                        className="block rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-cyan-500 hover:text-cyan-700"
                      >
                        Voir le résultat
                      </Link>
                    ) : evaluation.type === "QCM" ? (
                      <Link
                        to={`/apprenant/evaluations/${evaluation.id}/qcm`}
                        className="block rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-cyan-700"
                      >
                        Passer le QCM
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
                      >
                        Soumettre le devoir
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default EvaluationsPage;