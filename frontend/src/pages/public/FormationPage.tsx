import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Footer from "../../components/Footer";
import { formatPrix, formatType, NIVEAUX } from "../../utils/format";

import {
  getFormations,
  type Formation,
} from "../../services/formation.service";

type Onglet = "TOUTES" | "CONTINUE" | "PROFESSIONNELLE";

const ONGLETS: { valeur: Onglet; label: string }[] = [
  { valeur: "TOUTES", label: "Toutes" },
  { valeur: "CONTINUE", label: "Formation continue" },
  { valeur: "PROFESSIONNELLE", label: "Formation professionnelle" },
];

const DOMAINES_PRO = [
  "Administration Système et Réseaux",
  "Développement d'application",
  "Outillages",
];

function FormationCard({ formation }: { formation: Formation }) {
  const estContinue = formation.type === "CONTINUE";

  return (
    <article
      className={`group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        estContinue
          ? "border-cyan-200 border-l-4 border-l-cyan-500"
          : "border-slate-200"
      }`}
    >
      <div className="mb-5">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            estContinue
              ? "bg-cyan-100 text-cyan-700"
              : "bg-slate-900 text-cyan-300"
          }`}
        >
          {formatType(formation.type)}
          {formation.niveau ? ` · ${formation.niveau}` : ""}
        </span>
      </div>

      <h3 className="text-xl font-bold text-slate-900">{formation.titre}</h3>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
        {formation.description || "Aucune description disponible."}
      </p>

      <div className="mt-4 flex gap-4 text-sm text-slate-500">
        <span>{formation._count.cours} cours</span>
        <span>{formation._count.sessions} sessions</span>
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
  );
}

function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const typeUrl = searchParams.get("type");

  const [onglet, setOnglet] = useState<Onglet>(
    typeUrl === "CONTINUE" || typeUrl === "PROFESSIONNELLE"
      ? typeUrl
      : "TOUTES"
  );

  useEffect(() => {
    async function chargerFormations() {
      try {
        const data = await getFormations(1, 100);
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

  const continues = formations.filter((f) => f.type === "CONTINUE");
  const professionnelles = formations.filter(
    (f) => f.type === "PROFESSIONNELLE"
  );

  const afficherContinue = onglet !== "PROFESSIONNELLE";
  const afficherPro = onglet !== "CONTINUE";

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-900 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-white"
          >
            ← Retour à l'accueil
          </Link>
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
        {/* ONGLETS */}
        <div className="flex flex-wrap gap-3">
          {ONGLETS.map((o) => (
            <button
              key={o.valeur}
              type="button"
              onClick={() => setOnglet(o.valeur)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                onglet === o.valeur
                  ? "bg-slate-900 text-cyan-300"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-cyan-500 hover:text-cyan-700"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {loading && (
          <p className="mt-10 text-slate-500">Chargement des formations...</p>
        )}

        {error && <p className="mt-10 text-red-600">{error}</p>}

        {!loading && !error && formations.length === 0 && (
          <p className="mt-10 text-slate-500">Aucune formation disponible.</p>
        )}

        {!loading && !error && formations.length > 0 && (
          <div className="mt-10 space-y-16">
            {/* FORMATION CONTINUE */}
            {afficherContinue && (
              <div>
                <div className="border-b border-slate-200 pb-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900">
                      Formation continue
                    </h2>

                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-cyan-300">
                      L1 jusqu'à M2
                    </span>
                  </div>

                  <p className="mt-3 max-w-3xl text-slate-600">
                    Cours d'appui pour aider les étudiants universitaires à
                    renforcer leurs connaissances, réussir leur parcours
                    académique et se préparer efficacement à leur avenir
                    professionnel.
                  </p>
                </div>

                {continues.length === 0 ? (
                  <p className="mt-8 text-slate-500">
                    Aucune formation continue disponible pour le moment.
                  </p>
                ) : (
                  <div className="mt-8 space-y-10">
                    {NIVEAUX.map((niveau) => {
                      const matieres = continues.filter(
                        (f) => f.niveau === niveau
                      );

                      if (matieres.length === 0) {
                        return null;
                      }

                      return (
                        <div key={niveau}>
                          <h3 className="mb-4 text-lg font-bold text-cyan-700">
                            Niveau {niveau}
                            <span className="ml-2 text-sm font-medium text-slate-400">
                              {matieres.length} matière
                              {matieres.length > 1 ? "s" : ""}
                            </span>
                          </h3>

                          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {matieres.map((formation) => (
                              <FormationCard
                                key={formation.id}
                                formation={formation}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* FORMATION PROFESSIONNELLE */}
            {afficherPro && (
              <div>
                <div className="border-b border-slate-200 pb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Formation professionnelle
                  </h2>

                  <p className="mt-3 max-w-3xl text-slate-600">
                    Adaptées à tous, visant à développer des compétences
                    pratiques pour une meilleure évolution de carrière.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {DOMAINES_PRO.map((domaine) => (
                      <span
                        key={domaine}
                        className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                      >
                        {domaine}
                      </span>
                    ))}
                  </div>
                </div>

                {professionnelles.length === 0 ? (
                  <p className="mt-8 text-slate-500">
                    Aucune formation professionnelle disponible pour le moment.
                  </p>
                ) : (
                  <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {professionnelles.map((formation) => (
                      <FormationCard
                        key={formation.id}
                        formation={formation}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default FormationsPage;