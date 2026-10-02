import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getDashboardFormateur,
  type DashboardFormateur,
} from "../../services/dashboard.service";

function FormateurDashboard() {
  const [dashboard, setDashboard] =
    useState<DashboardFormateur | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function chargerDashboard() {
      try {
        const data = await getDashboardFormateur();

        setDashboard(data);
      } catch (err) {
        console.error(err);

        setError(
          "Impossible de charger le tableau de bord."
        );
      } finally {
        setLoading(false);
      }
    }

    chargerDashboard();
  }, []);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function formatHeure(date: string) {
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statutLabel(
    statut: "NON_DEMARREE" | "EN_COURS" | "TERMINEE"
  ) {
    switch (statut) {
      case "NON_DEMARREE":
        return "Non démarrée";

      case "EN_COURS":
        return "En cours";

      case "TERMINEE":
        return "Terminée";
    }
  }

  function statutDot(
    statut: "NON_DEMARREE" | "EN_COURS" | "TERMINEE"
  ) {
    switch (statut) {
      case "NON_DEMARREE":
        return "bg-amber-500";

      case "EN_COURS":
        return "bg-emerald-500";

      case "TERMINEE":
        return "bg-slate-400";
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Chargement du tableau de bord...
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-red-600">
          {error || "Dashboard indisponible."}
        </div>
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
            Tableau de bord
          </h1>

          <p className="mt-2 text-slate-600">
            Vue d'ensemble de vos formations et activités.
          </p>
        </header>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Formations
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {dashboard.formations}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
                 Apprenants
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {dashboard.apprenants}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Sessions
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {dashboard.sessions}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Évaluations
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {dashboard.evaluations}
            </p>
          </article>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Prochaines sessions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Vos prochaines visioconférences programmées.
              </p>
            </div>

            <Link
              to="/formateur/sessions"
              className="text-sm font-semibold text-cyan-700 hover:text-cyan-900"
            >
              Voir les sessions →
            </Link>
          </div>

          {dashboard.prochainesSessions.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8">
              <p className="text-sm text-slate-600">
                Aucune session prévue pour le moment.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {dashboard.prochainesSessions.map(
                (session) => (
                  <article
                    key={session.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                          {session.formation.titre}
                        </p>

                        <h3 className="mt-2 text-lg font-bold text-slate-900">
                          {session.titre}
                        </h3>

                        <div className="mt-3 flex flex-wrap gap-5 text-sm text-slate-500">
                          <span>
                            {formatDate(
                              session.dateDebut
                            )}
                          </span>

                          <span>
                            {formatHeure(
                              session.dateDebut
                            )}
                            {" - "}
                            {formatHeure(
                              session.dateFin
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span
                          className={`h-2 w-2 rounded-full ${statutDot(
                            session.statut
                          )}`}
                        />

                        {statutLabel(
                          session.statut
                        )}
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default FormateurDashboard;