import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getMesFormations,
  type InscriptionApprenant,
} from "../../services/apprenant.service";

import { useAuth } from "../../hooks/useAuth";

function ApprenantDashboard() {
  const { user } = useAuth();

  const [inscriptions, setInscriptions] = useState<InscriptionApprenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function chargerInscriptions() {
      try {
        const data = await getMesFormations();
        setInscriptions(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger vos formations.");
      } finally {
        setLoading(false);
      }
    }

    chargerInscriptions();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* En-tête */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
              Espace apprenant
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Bonjour {user?.prenom}
            </h1>

            <p className="mt-2 text-slate-600">
              Suivez vos inscriptions et accédez à vos formations validées.
            </p>
          </div>

          <Link
            to="/formations"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-cyan-500 hover:text-cyan-700"
          >
            Voir les formations
          </Link>
        </div>

        {/* Chargement */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-slate-500">
              Chargement de vos inscriptions...
            </p>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-white p-6">
            <p className="text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Aucune inscription */}
        {!loading && !error && inscriptions.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50 text-xl text-cyan-700">
              ◈
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Aucune inscription
            </h2>

            <p className="mt-2 text-slate-600">
              Vous n'êtes encore inscrit à aucune formation.
            </p>

            <Link
              to="/formations"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-cyan-700"
            >
              Découvrir les formations
            </Link>
          </div>
        )}

        {/* Liste des inscriptions */}
        {!loading && !error && inscriptions.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {inscriptions.map((inscription) => (
              <article
                key={inscription.id}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {/* Accent gauche */}
                <div className="absolute left-0 top-0 h-full w-1 bg-cyan-500" />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                      Formation
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-slate-900">
                      {inscription.formation.titre}
                    </h2>
                  </div>

                  {/* Statut discret */}
                  <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-700">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        inscription.statut === "VALIDEE"
                          ? "bg-emerald-500"
                          : inscription.statut === "EN_ATTENTE"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                    />

                    {inscription.statut === "VALIDEE"
                      ? "Validée"
                      : inscription.statut === "EN_ATTENTE"
                      ? "En attente"
                      : "Refusée"}
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {inscription.formation.description ||
                    "Aucune description disponible."}
                </p>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  {inscription.statut === "VALIDEE" && (
                    <Link
                      to={`/apprenant/formations/${inscription.formation.id}`}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
                    >
                      Accéder à la formation
                    </Link>
                  )}

                  {inscription.statut === "EN_ATTENTE" && (
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Votre demande est en cours de validation.
                      </p>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Pensez à consulter régulièrement votre e-mail et à
                        contacter le centre si nécessaire.
                      </p>
                    </div>
                  )}

                  {inscription.statut === "REFUSEE" && (
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Cette inscription n'a pas été validée.
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        Vous pouvez contacter le centre pour plus d'informations.
                      </p>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ApprenantDashboard;