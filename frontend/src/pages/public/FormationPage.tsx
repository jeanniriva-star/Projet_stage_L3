import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import { formatPrix } from "../../utils/format";

import {
  getFormations,
  type Formation,
} from "../../services/formation.service";

function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function chargerFormations() {
      try {
        const data = await getFormations();
        setFormations(data.formations);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les formations.");
      } finally {
        setLoading(false);
      }
    }

    chargerFormations();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-900 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">
            Catalogue
          </p>

          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
            Nos formations
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            Découvrez les formations disponibles et choisissez celle qui
            correspond à vos objectifs.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        {loading && (
          <p className="text-slate-500">
            Chargement des formations...
          </p>
        )}

        {error && (
          <p className="text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && formations.length === 0 && (
          <p className="text-slate-500">
            Aucune formation disponible.
          </p>
        )}

        {!loading && !error && formations.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {formations.map((formation) => (
              <article
                key={formation.id}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
               <div className="mb-5">
              <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-cyan-300">
                Formation
              </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  {formation.titre}
                </h2>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                  {formation.description || "Aucune description disponible."}
                </p>

                <div className="mt-4 flex gap-4 text-sm text-slate-500">
                  <span>
                    {formation._count.cours} cours
                  </span>

                  <span>
                    {formation._count.sessions} sessions
                  </span>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Prix
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {formatPrix(formation.prix)}
                  </p>
                </div>

                <div className="mt-6 flex gap-3">
                  <Link
                    to={`/formation/${formation.id}`}
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-cyan-500 hover:text-cyan-700"
                  >
                    Voir détails
                  </Link>

                  <Link
                    to={`/register?formationId=${formation.id}`}
                    className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-cyan-700"
                    >
                    S'inscrire
                 </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default FormationsPage;
<Footer />