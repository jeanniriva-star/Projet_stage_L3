import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getCoursFormation,
  type CoursFormation,
} from "../../services/cours.service";

function FormationFormateurPage() {
  const { id } = useParams();

  const [titreFormation, setTitreFormation] = useState("");
  const [cours, setCours] = useState<CoursFormation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function chargerFormation() {
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
          "Impossible de charger cette formation."
        );
      } finally {
        setLoading(false);
      }
    }

    chargerFormation();
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
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/formateur/formations"
          className="text-sm font-semibold text-cyan-700 hover:text-cyan-900"
        >
          ← Retour à mes formations
        </Link>

        <header className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Gestion de formation
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {titreFormation}
          </h1>

          <p className="mt-2 text-slate-600">
            Gérez les cours associés à cette formation.
          </p>
        </header>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Cours
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {cours.length} cours disponible
                {cours.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {cours.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8">
              <p className="text-sm text-slate-600">
                Aucun cours n'a encore été ajouté à cette formation.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
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

                      <h3 className="mt-2 text-lg font-bold text-slate-900">
                        {coursItem.titre}
                      </h3>

                      {coursItem.description && (
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                          {coursItem.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-500">
                        <span>
                          {coursItem._count.ressources} ressource
                          {coursItem._count.ressources > 1 ? "s" : ""}
                        </span>

                        <span>
                          {coursItem._count.evaluations} évaluation
                          {coursItem._count.evaluations > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/formateur/cours/${coursItem.id}`}
                      className="shrink-0 rounded-xl bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-cyan-700"
                    >
                      Gérer le cours
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default FormationFormateurPage;