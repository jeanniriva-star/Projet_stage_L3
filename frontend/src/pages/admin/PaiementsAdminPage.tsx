import { useEffect, useState, type FormEvent } from "react";

import {
  getPaiementsAdmin,
  type MethodePaiement,
  type PaiementsAdminResponse,
  type StatutPaiement,
} from "../../services/paiement.service";
import { getErrorMessage } from "../../utils/errors";
import { formatPrix } from "../../utils/format";

const STATUTS: { valeur: StatutPaiement; label: string }[] = [
  { valeur: "REUSSI", label: "Réussi" },
  { valeur: "ECHOUE", label: "Échoué" },
  { valeur: "EN_ATTENTE", label: "En attente" },
  { valeur: "ANNULE", label: "Annulé" },
];

const METHODES: { valeur: MethodePaiement; label: string }[] = [
  { valeur: "MVOLA", label: "MVola" },
  { valeur: "ORANGE_MONEY", label: "Orange Money" },
  { valeur: "AIRTEL_MONEY", label: "Airtel Money" },
];

const STYLE_STATUT: Record<StatutPaiement, string> = {
  REUSSI: "bg-emerald-100 text-emerald-700",
  ECHOUE: "bg-red-100 text-red-700",
  EN_ATTENTE: "bg-amber-100 text-amber-700",
  ANNULE: "bg-slate-100 text-slate-600",
};

const COLONNES = [
  "Référence",
  "Apprenant",
  "Formation",
  "Montant",
  "Moyen",
  "Statut",
  "Date",
];

function libelleMethode(methode: MethodePaiement) {
  return METHODES.find((item) => item.valeur === methode)?.label ?? methode;
}

function libelleStatut(statut: StatutPaiement) {
  return STATUTS.find((item) => item.valeur === statut)?.label ?? statut;
}

function PaiementsAdminPage() {
  const [page, setPage] = useState(1);
  const [saisie, setSaisie] = useState("");
  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState<StatutPaiement | "">("");
  const [methode, setMethode] = useState<MethodePaiement | "">("");

  const [resultat, setResultat] = useState<{
    cle: string;
    data: PaiementsAdminResponse;
  } | null>(null);

  const [erreur, setErreur] = useState<{
    cle: string;
    message: string;
  } | null>(null);

  // Identifie la requête en cours : si elle change, on recharge
  const cle = `${page}|${recherche}|${statut}|${methode}`;

  useEffect(() => {
    let annule = false;

    getPaiementsAdmin({
      page,
      limit: 10,
      search: recherche,
      ...(statut && { statut }),
      ...(methode && { methode }),
    })
      .then((data) => {
        if (!annule) {
          setResultat({ cle, data });
        }
      })
      .catch((err: unknown) => {
        if (!annule) {
          console.error("Erreur paiements admin :", err);

          setErreur({
            cle,
            message: getErrorMessage(err, "Impossible de charger les paiements."),
          });
        }
      });

    return () => {
      annule = true;
    };
  }, [cle, page, recherche, statut, methode]);

  const data = resultat?.data;
  const erreurAffichee = erreur?.cle === cle ? erreur.message : "";
  const enChargement = resultat?.cle !== cle && erreur?.cle !== cle;

  function handleRecherche(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPage(1);
    setRecherche(saisie.trim());
  }

  function reinitialiser() {
    setSaisie("");
    setRecherche("");
    setStatut("");
    setMethode("");
    setPage(1);
  }

  const filtresActifs = recherche !== "" || statut !== "" || methode !== "";

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <header className="border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">Paiements</h1>

          <p className="mt-2 text-slate-600">
            Suivez les paiements des inscriptions (mode simulation).
          </p>
        </header>

        {/* STATISTIQUES */}

        {data && (
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total encaissé
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatPrix(String(data.stats.totalEncaisse))}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Réussis
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {data.stats.reussis}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Échoués
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {data.stats.echoues}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                En attente
              </p>

              <p className="mt-2 text-2xl font-bold text-amber-600">
                {data.stats.enAttente}
              </p>
            </div>
          </section>
        )}

        {/* RECHERCHE ET FILTRES */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form
            onSubmit={handleRecherche}
            className="flex flex-col gap-3 lg:flex-row"
          >
            <input
              type="search"
              value={saisie}
              onChange={(event) => setSaisie(event.target.value)}
              placeholder="Référence, nom, email ou formation..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-cyan-600"
            />

            <select
              value={statut}
              onChange={(event) => {
                setStatut(event.target.value as StatutPaiement | "");
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-600"
            >
              <option value="">Tous les statuts</option>
              {STATUTS.map((item) => (
                <option key={item.valeur} value={item.valeur}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={methode}
              onChange={(event) => {
                setMethode(event.target.value as MethodePaiement | "");
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-600"
            >
              <option value="">Tous les moyens</option>
              {METHODES.map((item) => (
                <option key={item.valeur} value={item.valeur}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Rechercher
            </button>

            {filtresActifs && (
              <button
                type="button"
                onClick={reinitialiser}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Réinitialiser
              </button>
            )}
          </form>
        </section>

        {erreurAffichee && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreurAffichee}
          </div>
        )}

        {/* TABLEAU */}

        {!data && enChargement && (
          <div className="mt-8 text-slate-500">Chargement des paiements...</div>
        )}

        {data && data.paiements.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            Aucun paiement.
          </div>
        )}

        {data && data.paiements.length > 0 && (
          <div
            className={`mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition ${
              enChargement ? "opacity-50" : ""
            }`}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-950">
                  <tr>
                    {COLONNES.map((colonne) => (
                      <th
                        key={colonne}
                        className="px-5 py-4 text-left text-xs font-semibold uppercase text-white"
                      >
                        {colonne}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {data.paiements.map((paiement) => (
                    <tr key={paiement.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-700">
                        {paiement.reference}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {paiement.inscription.apprenant.prenom}{" "}
                          {paiement.inscription.apprenant.nom}
                        </p>

                        <p className="text-xs text-slate-500">
                          {paiement.inscription.apprenant.email}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {paiement.inscription.formation.titre}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                        {formatPrix(paiement.montant)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                        {libelleMethode(paiement.methode)}

                        <p className="text-xs text-slate-400">
                          {paiement.telephone}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            STYLE_STATUT[paiement.statut]
                          }`}
                        >
                          {libelleStatut(paiement.statut)}
                        </span>

                        {paiement.motifEchec && (
                          <p className="mt-1 max-w-[12rem] text-xs text-slate-500">
                            {paiement.motifEchec}
                          </p>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {new Date(paiement.createdAt).toLocaleString("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGINATION */}

        {data && data.pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              disabled={!data.pagination.hasPreviousPage || enChargement}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              ← Précédent
            </button>

            <p className="text-sm text-slate-500">
              Page {data.pagination.page} sur {data.pagination.totalPages} (
              {data.pagination.total} paiement
              {data.pagination.total > 1 ? "s" : ""})
            </p>

            <button
              type="button"
              disabled={!data.pagination.hasNextPage || enChargement}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaiementsAdminPage;