import { useEffect, useState } from "react";

import {
  getMesResultats,
  type ResultatApprenant,
} from "../../services/evaluation.service";

function ResultatsPage() {
  const [resultats, setResultats] = useState<ResultatApprenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function chargerResultats() {
      try {
        const data = await getMesResultats();
        setResultats(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger vos résultats.");
      } finally {
        setLoading(false);
      }
    }

    chargerResultats();
  }, []);
  console.log("Résultats reçus :", resultats);

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Espace apprenant
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Mes résultats
          </h1>

          <p className="mt-2 text-slate-600">
            Consultez les résultats de vos évaluations.
          </p>
        </div>

        {loading && (
          <p className="text-slate-500">
            Chargement des résultats...
          </p>
        )}

        {error && (
          <p className="text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && resultats.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-600">
              Aucun résultat disponible pour le moment.
            </p>
          </div>
        )}

        {!loading && !error && resultats.length > 0 && (
          <div className="space-y-4">
            {resultats.map((resultat) => (
              <article
                key={resultat.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                      {resultat.evaluation.cours.formation.titre}
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-slate-900">
                      {resultat.evaluation.titre}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {resultat.evaluation.cours.titre}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                      <span>
                        Type : {resultat.evaluation.type}
                      </span>

                      {resultat.dateSoumission && (
                        <span>
                          Soumis le{" "}
                          {new Date(
                            resultat.dateSoumission
                          ).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="min-w-28 text-left sm:text-right">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Note
                    </p>

                    <p
                        dir="ltr"
                        className="mt-1 whitespace-nowrap text-3xl font-bold text-slate-900"
                        >
                        {resultat.note !== null ? (
                            <>
                            <span>{resultat.note}</span>
                            <span>/20</span>
                            </>
                        ) : (
                            "—"
                        )}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultatsPage;