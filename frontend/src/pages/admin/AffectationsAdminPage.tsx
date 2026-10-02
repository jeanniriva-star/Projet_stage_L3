import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import axios from "axios";

import {
  createAffectationAdmin,
  deleteAffectationAdmin,
  getAffectationsAdmin,
  type AffectationAdmin,
} from "../../services/affectation.service";

import {
  getUsersAdmin,
  type UserAdmin,
} from "../../services/user.service";

import {
  getFormations,
  type Formation,
} from "../../services/formation.service";

function AffectationsAdminPage() {
  const [
    affectations,
    setAffectations,
  ] = useState<AffectationAdmin[]>([]);

  const [
    formateurs,
    setFormateurs,
  ] = useState<UserAdmin[]>([]);

  const [
    formations,
    setFormations,
  ] = useState<Formation[]>([]);

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
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    formateurId,
    setFormateurId,
  ] = useState("");

  const [
    formationId,
    setFormationId,
  ] = useState("");

  const [
    creating,
    setCreating,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState<string | null>(
    null
  );

  // =====================================================
  // CHARGER AFFECTATIONS
  // =====================================================

  async function chargerAffectations(
    pageDemandee = page,
    rechercheDemandee = recherche
  ) {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAffectationsAdmin(
          pageDemandee,
          10,
          rechercheDemandee
        );

      setAffectations(
        data.affectations
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
    } catch (err: unknown) {
      console.error(
        "Erreur chargement affectations :",
        err
      );

      if (
        axios.isAxiosError(err)
      ) {
        setError(
          err.response?.data?.message ??
            "Impossible de charger les affectations."
        );
      } else {
        setError(
          "Impossible de charger les affectations."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // INITIALISATION
  // =====================================================

  useEffect(() => {
    let annule = false;

    async function initialiser() {
      try {
        const [
          affectationsData,
          usersData,
          formationsData,
        ] = await Promise.all([
          getAffectationsAdmin(
            1,
            10,
            ""
          ),

          getUsersAdmin(
            1,
            100,
            "",
            "FORMATEUR"
          ),

          getFormations(),
        ]);

        if (annule) {
          return;
        }

        setAffectations(
          affectationsData.affectations
        );

        setPage(
          affectationsData.pagination.page
        );

        setTotalPages(
          affectationsData.pagination.totalPages
        );

        setTotal(
          affectationsData.pagination.total
        );

        setFormateurs(
          usersData.utilisateurs
        );

        setFormations(
        formationsData.formations
        );
      } catch (err: unknown) {
        if (annule) {
          return;
        }

        console.error(
          "Erreur initialisation affectations :",
          err
        );

        if (
          axios.isAxiosError(err)
        ) {
          setError(
            err.response?.data?.message ??
              "Impossible de charger les données."
          );
        } else {
          setError(
            "Impossible de charger les données."
          );
        }
      } finally {
        if (!annule) {
          setLoading(false);
        }
      }
    }

    initialiser();

    return () => {
      annule = true;
    };
  }, []);


  // RECHERCHE
 

  async function handleRecherche(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await chargerAffectations(
      1,
      recherche
    );
  }

  // =====================================================
  // CRÉATION
  // =====================================================

  async function handleCreate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !formateurId ||
      !formationId
    ) {
      window.alert(
        "Veuillez sélectionner un formateur et une formation."
      );

      return;
    }

    try {
      setCreating(true);

      await createAffectationAdmin({
        formateurId,
        formationId,
      });

      setFormateurId("");
      setFormationId("");
      setShowForm(false);

      await chargerAffectations(
        1,
        recherche
      );

      window.alert(
        "Formateur affecté avec succès."
      );
    } catch (err: unknown) {
      console.error(
        "Erreur création affectation :",
        err
      );

      if (
        axios.isAxiosError(err)
      ) {
        window.alert(
          err.response?.data?.message ??
            "Impossible de créer l'affectation."
        );
      } else {
        window.alert(
          "Impossible de créer l'affectation."
        );
      }
    } finally {
      setCreating(false);
    }
  }

  // =====================================================
  // SUPPRESSION
  // =====================================================

  async function handleDelete(
    affectation: AffectationAdmin
  ) {
    const confirmation =
      window.confirm(
        `Retirer ${affectation.formateur.prenom} ${affectation.formateur.nom} de la formation "${affectation.formation.titre}" ?`
      );

    if (!confirmation) {
      return;
    }

    try {
      setDeletingId(
        affectation.id
      );

      const resultat =
        await deleteAffectationAdmin(
          affectation.id
        );

      window.alert(
        resultat.message
      );

      await chargerAffectations(
        page,
        recherche
      );
    } catch (err: unknown) {
      console.error(
        "Erreur suppression affectation :",
        err
      );

      if (
        axios.isAxiosError(err)
      ) {
        window.alert(
          err.response?.data?.message ??
            "Impossible de supprimer l'affectation."
        );
      } else {
        window.alert(
          "Impossible de supprimer l'affectation."
        );
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <header className="border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Administration
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Affectations
              </h1>

              <p className="mt-2 text-slate-600">
                Gérez les formateurs affectés aux formations.
              </p>

              <p className="mt-3 text-sm text-slate-500">
                {total} affectation
                {total > 1 ? "s" : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowForm(
                  (value) => !value
                )
              }
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              {showForm
                ? "Fermer"
                : "Nouvelle affectation"}
            </button>
          </div>
        </header>

        {/* FORMULAIRE */}

        {showForm && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Affecter un formateur
            </h2>

            <form
              onSubmit={
                handleCreate
              }
              className="mt-6 grid gap-5 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Formateur
                </label>

                <select
                  value={
                    formateurId
                  }
                  onChange={(event) =>
                    setFormateurId(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-600"
                >
                  <option value="">
                    Sélectionner un formateur
                  </option>

                  {formateurs.map(
                    (formateur) => (
                      <option
                        key={
                          formateur.id
                        }
                        value={
                          formateur.id
                        }
                      >
                        {
                          formateur.prenom
                        }{" "}
                        {
                          formateur.nom
                        }{" "}
                        -{" "}
                        {
                          formateur.email
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Formation
                </label>

                <select
                  value={
                    formationId
                  }
                  onChange={(event) =>
                    setFormationId(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-600"
                >
                  <option value="">
                    Sélectionner une formation
                  </option>

                  {formations.map(
                    (formation) => (
                      <option
                        key={
                          formation.id
                        }
                        value={
                          formation.id
                        }
                      >
                        {
                          formation.titre
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormateurId("");
                    setFormationId("");
                  }}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={
                    creating
                  }
                  className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {creating
                    ? "Affectation..."
                    : "Affecter"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* RECHERCHE */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
              onChange={(event) =>
                setRecherche(
                  event.target.value
                )
              }
              placeholder="Formateur, email ou formation..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-cyan-600"
            />

            <button
              type="submit"
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Rechercher
            </button>

            {recherche && (
              <button
                type="button"
                onClick={() => {
                  setRecherche("");

                  void chargerAffectations(
                    1,
                    ""
                  );
                }}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
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

        {/* TABLEAU */}

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
            Chargement des affectations...
          </div>
        ) : affectations.length ===
          0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="font-bold text-slate-900">
              Aucune affectation
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Aucune affectation ne correspond à votre recherche.
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">

                <thead className="bg-slate-950">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white">
                      Formateur
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white">
                      Email
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white">
                      Téléphone
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white">
                      Formation
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-white">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {affectations.map(
                    (affectation) => (
                      <tr
                        key={
                          affectation.id
                        }
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                          {
                            affectation.formateur
                              .prenom
                          }{" "}
                          {
                            affectation.formateur
                              .nom
                          }
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {
                            affectation.formateur
                              .email
                          }
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                          {
                            affectation.formateur
                              .telephone
                          }
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-cyan-700">
                          {
                            affectation.formation
                              .titre
                          }
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <button
                            type="button"
                            disabled={
                              deletingId ===
                              affectation.id
                            }
                            onClick={() =>
                              handleDelete(
                                affectation
                              )
                            }
                            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId ===
                            affectation.id
                              ? "Suppression..."
                              : "Supprimer"}
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
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
                  void chargerAffectations(
                    page - 1,
                    recherche
                  )
                }
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
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
                  void chargerAffectations(
                    page + 1,
                    recherche
                  )
                }
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
              >
                Suivant →
              </button>
            </div>
          )}
      </div>
    </div>
  );
}

export default AffectationsAdminPage;