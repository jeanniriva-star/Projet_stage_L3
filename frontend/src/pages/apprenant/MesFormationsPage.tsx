import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getMesFormations,
  type InscriptionApprenant,
} from "../../services/apprenant.service";

function MesFormationsPage() {
  const [inscriptions, setInscriptions] = useState<InscriptionApprenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function chargerFormations() {
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

    chargerFormations();
  }, []);

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Espace apprenant
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Mes formations
          </h1>

          <p className="mt-2 text-slate-600">
            Consultez vos inscriptions et accédez aux formations validées.
          </p>
        </div>

        {loading && (
          <p className="text-slate-500">
            Chargement...
          </p>
        )}

        {error && (
          <p className="text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && inscriptions.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-600">
              Vous n'avez encore aucune formation.
            </p>

            <Link
              to="/formations"
              className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-cyan-700"
            >
              Voir les formations
            </Link>
          </div>
        )}

        {!loading && !error && inscriptions.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {inscriptions.map((inscription) => (
              <article
                key={inscription.id}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
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

                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
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
                  {inscription.statut === "VALIDEE" ? (
                    <Link
                      to={`/apprenant/formations/${inscription.formation.id}`}
                      className="block rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-cyan-700"
                    >
                      Accéder à la formation
                    </Link>
                  ) : inscription.statut === "EN_ATTENTE" ? (
                    <p className="text-sm text-slate-600">
                      Votre demande est en attente de validation.
                    </p>
                  ) : (
                    <p className="text-sm text-slate-600">
                      Cette inscription n'a pas été validée.
                    </p>
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

export default MesFormationsPage;