import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getMesFormationsFormateur,
  type FormationAffectee,
} from "../../services/affectation.service";

function MesFormationsFormateurPage() {
  const [affectations, setAffectations] = useState<FormationAffectee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function chargerFormations() {
      try {
        const data = await getMesFormationsFormateur();
        setAffectations(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger vos formations.");
      } finally {
        setLoading(false);
      }
    }

    chargerFormations();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Chargement des formations...
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
            Mes formations
          </h1>

          <p className="mt-2 text-slate-600">
            Gérez les formations auxquelles vous êtes affecté.
          </p>
        </header>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!error && affectations.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-lg font-bold text-slate-900">
              Aucune formation affectée
            </h2>

            <p className="mt-2 text-slate-600">
              Vous n'êtes affecté à aucune formation pour le moment.
            </p>
          </div>
        )}

        {!error && affectations.length > 0 && (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {affectations.map((affectation) => {
              const formation = affectation.formation;

              return (
                <article
                  key={affectation.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                    Formation
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    {formation.titre}
                  </h2>

                  {formation.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                      {formation.description}
                    </p>
                  )}

                  <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-100 pt-5 text-center">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {formation._count.cours}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Cours
                      </p>
                    </div>

                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {formation._count.sessions}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Sessions
                      </p>
                    </div>

                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {formation._count.inscriptions}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Apprenants
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link
                      to={`/formateur/formations/${formation.id}`}
                      className="inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
                    >
                      Gérer la formation
                    </Link>
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

export default MesFormationsFormateurPage;