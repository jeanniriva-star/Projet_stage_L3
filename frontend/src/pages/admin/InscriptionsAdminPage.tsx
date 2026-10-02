import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  getInscriptionsEnAttente,
  updateStatutInscription,
  type InscriptionAdmin,
} from "../../services/inscription.service";

function InscriptionsAdminPage() {
  const [
    inscriptions,
    setInscriptions,
  ] = useState<
    InscriptionAdmin[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    recherche,
    setRecherche,
  ] = useState("");

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    actionId,
    setActionId,
  ] =
    useState<string | null>(
      null
    );

  async function chargerInscriptions(
    pageDemandee = page,
    rechercheDemandee = recherche
  ) {
    try {
      setLoading(true);
      setError("");

      const data =
        await getInscriptionsEnAttente(
          pageDemandee,
          10,
          rechercheDemandee
        );

      setInscriptions(
        data.inscriptions
      );

      setPage(
        data.pagination.page
      );

      setTotalPages(
        data.pagination.totalPages
      );

      setTotal(
        data.pagination.total
      );
    } catch (error: unknown) {
      console.error(
        "Erreur inscriptions admin :",
        error
      );

      if (
        axios.isAxiosError(
          error
        )
      ) {
        setError(
          error.response?.data
            ?.message ??
            "Impossible de charger les inscriptions."
        );
      } else {
        setError(
          "Impossible de charger les inscriptions."
        );
      }
    } finally {
      setLoading(false);
    }
  }

useEffect(() => {
  let annule = false;

  async function initialiserInscriptions() {
    try {
      const data =
        await getInscriptionsEnAttente(
          1,
          10,
          ""
        );

      if (annule) {
        return;
      }

      setInscriptions(
        data.inscriptions
      );

      setPage(
        data.pagination.page
      );

      setTotalPages(
        data.pagination.totalPages
      );

      setTotal(
        data.pagination.total
      );
    } catch (error: unknown) {
      if (annule) {
        return;
      }

      console.error(
        "Erreur inscriptions admin :",
        error
      );

      if (
        axios.isAxiosError(
          error
        )
      ) {
        setError(
          error.response?.data
            ?.message ??
            "Impossible de charger les inscriptions."
        );
      } else {
        setError(
          "Impossible de charger les inscriptions."
        );
      }
    } finally {
      if (!annule) {
        setLoading(false);
      }
    }
  }

  initialiserInscriptions();

  return () => {
    annule = true;
  };
}, []);

  async function handleRecherche(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await chargerInscriptions(
      1,
      recherche
    );
  }

  async function handleChangerStatut(
    inscriptionId: string,
    statut:
      | "VALIDEE"
      | "REFUSEE"
  ) {
    const confirmation =
      window.confirm(
        statut === "VALIDEE"
          ? "Voulez-vous valider cette inscription ?"
          : "Voulez-vous refuser cette inscription ?"
      );

    if (!confirmation) {
      return;
    }

    try {
      setActionId(
        inscriptionId
      );

      await updateStatutInscription(
        inscriptionId,
        statut
      );

      /*
       * L'inscription disparaît de la
       * liste car elle n'est plus
       * EN_ATTENTE.
       */
      await chargerInscriptions(
        page,
        recherche
      );
    } catch (error: unknown) {
      console.error(
        "Erreur traitement inscription :",
        error
      );

      if (
        axios.isAxiosError(
          error
        )
      ) {
        window.alert(
          error.response?.data
            ?.message ??
            "Impossible de traiter cette inscription."
        );
      } else {
        window.alert(
          "Impossible de traiter cette inscription."
        );
      }
    } finally {
      setActionId(null);
    }
  }

  function formatDate(
    date: string
  ) {
    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(
      new Date(date)
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Inscriptions
          </h1>

          <p className="mt-2 max-w-3xl text-slate-600">
            Consultez et traitez les
            demandes d'inscription en
            attente.
          </p>

          <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />

            <span>
              {total} demande
              {total > 1
                ? "s"
                : ""}{" "}
              en attente
            </span>
          </div>
        </header>

        {/* RECHERCHE */}

        <section className="mt-8">
          <form
            onSubmit={
              handleRecherche
            }
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="search"
              value={
                recherche
              }
              onChange={(
                event
              ) =>
                setRecherche(
                  event.target.value
                )
              }
              placeholder="Nom, prénom, email ou formation..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-600"
            />

            <button
              type="submit"
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              Rechercher
            </button>

            {recherche && (
              <button
                type="button"
                onClick={() => {
                  setRecherche("");

                  chargerInscriptions(
                    1,
                    ""
                  );
                }}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Réinitialiser
              </button>
            )}
          </form>
        </section>

        {/* ERREUR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
            Chargement des inscriptions...
          </div>
        ) : inscriptions.length ===
          0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="font-bold text-slate-900">
              Aucune inscription en
              attente
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Toutes les demandes ont
              été traitées ou aucun
              résultat ne correspond à
              votre recherche.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {inscriptions.map(
              (
                inscription
              ) => (
                <article
                  key={
                    inscription.id
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                          {
                            inscription
                              .formation
                              .titre
                          }
                        </p>

                        <span className="flex items-center gap-2 text-sm text-amber-700">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />

                          En attente
                        </span>
                      </div>

                      <h2 className="mt-3 text-lg font-bold text-slate-900">
                        {
                          inscription
                            .apprenant
                            .prenom
                        }{" "}
                        {
                          inscription
                            .apprenant
                            .nom
                        }
                      </h2>

                      <div className="mt-3 space-y-1 text-sm text-slate-500">
                        <p>
                          Email :{" "}
                          {
                            inscription
                              .apprenant
                              .email
                          }
                        </p>

                        <p>
                          Téléphone :{" "}
                          {
                            inscription
                              .apprenant
                              .telephone
                          }
                        </p>

                        <p>
                          Demande envoyée :{" "}
                          {formatDate(
                            inscription
                              .dateInscription
                          )}
                        </p>
                      </div>

                      {inscription
                        .formation
                        .description && (
                        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
                          {
                            inscription
                              .formation
                              .description
                          }
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleChangerStatut(
                            inscription.id,
                            "VALIDEE"
                          )
                        }
                        disabled={
                          actionId ===
                          inscription.id
                        }
                        className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionId ===
                        inscription.id
                          ? "Traitement..."
                          : "Valider"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleChangerStatut(
                            inscription.id,
                            "REFUSEE"
                          )
                        }
                        disabled={
                          actionId ===
                          inscription.id
                        }
                        className="rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Refuser
                      </button>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}

        {/* PAGINATION */}

        {!loading &&
          totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between gap-4">
              <button
                type="button"
                disabled={
                  page <= 1
                }
                onClick={() =>
                  chargerInscriptions(
                    page - 1,
                    recherche
                  )
                }
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Précédent
              </button>

              <p className="text-sm text-slate-500">
                Page {page} sur{" "}
                {totalPages}
              </p>

              <button
                type="button"
                disabled={
                  page >=
                  totalPages
                }
                onClick={() =>
                  chargerInscriptions(
                    page + 1,
                    recherche
                  )
                }
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Suivant →
              </button>
            </div>
          )}
      </div>
    </div>
  );
}

export default InscriptionsAdminPage;