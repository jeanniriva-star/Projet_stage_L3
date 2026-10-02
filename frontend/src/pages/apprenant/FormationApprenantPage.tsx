import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getCoursFormation,
  type CoursFormation,
} from "../../services/cours.service";

function FormationApprenantPage() {
  const { id } = useParams();

  const [titreFormation, setTitreFormation] = useState("");
  const [cours, setCours] = useState<CoursFormation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function chargerCours() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCoursFormation(id);

        setTitreFormation(data.formation.titre);
        setCours(data.cours);
      } catch (err) {
        console.error(err);

        setError(
          "Vous n'êtes pas autorisé à accéder à cette formation."
        );
      } finally {
        setLoading(false);
      }
    }

    chargerCours();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Chargement de la formation...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <h1 className="text-xl font-bold text-slate-900">
            Accès impossible
          </h1>

          <p className="mt-3 text-slate-600">
            {error}
          </p>

          <Link
            to="/apprenant/mes-formations"
            className="mt-6 inline-flex text-sm font-semibold text-cyan-700"
          >
            ← Retour à mes formations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Formation
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {titreFormation}
          </h1>

          <p className="mt-2 text-slate-600">
            Consultez les cours et les ressources disponibles.
          </p>
        </div>

        {cours.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-600">
              Aucun cours disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {cours.map((coursItem) => (
              <article
                key={coursItem.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                      Cours {coursItem.ordre}
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-slate-900">
                      {coursItem.titre}
                    </h2>

                    {coursItem.description && (
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                        {coursItem.description}
                      </p>
                    )}

                    <div className="mt-4 flex gap-5 text-sm text-slate-500">
                      <span>
                        {coursItem._count.ressources} ressources
                      </span>

                      <span>
                        {coursItem._count.evaluations} évaluations
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/apprenant/cours/${coursItem.id}`}
                    className="shrink-0 rounded-xl bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-cyan-700"
                  >
                    Ouvrir le cours
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

export default FormationApprenantPage;