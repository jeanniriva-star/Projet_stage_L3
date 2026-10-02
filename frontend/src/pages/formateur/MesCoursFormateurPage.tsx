import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getMesCoursFormateur,
  type CoursFormateur,
} from "../../services/cours.service";

function MesCoursFormateurPage() {
  const [cours, setCours] = useState<CoursFormateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function chargerCours() {
      try {
        const data = await getMesCoursFormateur();
        setCours(data);
      } catch (error) {
        console.error(error);
        setError("Impossible de charger vos cours.");
      } finally {
        setLoading(false);
      }
    }

    chargerCours();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Chargement des cours...
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <header>
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Espace formateur
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Mes cours
          </h1>

          <p className="mt-2 text-slate-600">
            Gérez directement les cours de vos formations.
          </p>
        </header>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!error && cours.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="font-bold text-slate-900">
              Aucun cours
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Aucun cours n'est disponible actuellement.
            </p>
          </div>
        )}

        {!error && cours.length > 0 && (
          <div className="mt-8 space-y-4">
            {cours.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                      {item.formation.titre}
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-slate-900">
                      {item.titre}
                    </h2>

                    {item.description && (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-500">
                      <span>
                        Cours {item.ordre}
                      </span>

                      <span>
                        {item._count.ressources} ressource
                        {item._count.ressources > 1 ? "s" : ""}
                      </span>

                      <span>
                        {item._count.evaluations} évaluation
                        {item._count.evaluations > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/formateur/cours/${item.id}`}
                    className="shrink-0 rounded-xl bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-cyan-700"
                  >
                    Gérer le cours
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MesCoursFormateurPage;