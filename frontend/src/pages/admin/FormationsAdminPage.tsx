import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";

import axios from "axios";
import { onlyPrix, isValidPrix } from "../../utils/validation";
import { formatPrix } from "../../utils/format";
import {
  createFormationAdmin,
  deleteFormationAdmin,
  getFormationsAdmin,
  updateFormationAdmin,
  type FormationAdmin,
} from "../../services/formation.service";

function FormationsAdminPage() {
  const [
    formations,
    setFormations,
  ] = useState<FormationAdmin[]>([]);

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

  // =====================================================
  // CRÉATION
  // =====================================================

  const [
    showCreateForm,
    setShowCreateForm,
  ] = useState(false);

  const [
    titre,
    setTitre,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [prix, setPrix] = useState("");

  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  const [
    creating,
    setCreating,
  ] = useState(false);

  // =====================================================
  // MODIFICATION
  // =====================================================

  const [
    formationAModifier,
    setFormationAModifier,
  ] = useState<FormationAdmin | null>(null);

  const [
    editTitre,
    setEditTitre,
  ] = useState("");

  const [
    editDescription,
    setEditDescription,
  ] = useState("");

  const [editPrix, setEditPrix] = useState("");

  const [erreursEdit, setErreursEdit] = useState<Record<string, string>>({});

  const [
    updating,
    setUpdating,
  ] = useState(false);

  // =====================================================
  // SUPPRESSION
  // =====================================================

  const [
    deletingId,
    setDeletingId,
  ] = useState<string | null>(null);

  // =====================================================
  // CHARGEMENT
  // =====================================================

  async function chargerFormations(
    pageDemandee = page,
    rechercheDemandee = recherche
  ) {
    try {
      setLoading(true);
      setError("");

      const data =
        await getFormationsAdmin(
          pageDemandee,
          10,
          rechercheDemandee
        );

      setFormations(
        data.formations
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
        "Erreur formations admin :",
        err
      );

      if (
        axios.isAxiosError(err)
      ) {
        setError(
          err.response?.data?.message ??
            "Impossible de charger les formations."
        );
      } else {
        setError(
          "Impossible de charger les formations."
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
        const data =
          await getFormationsAdmin(
            1,
            10,
            ""
          );

        if (annule) {
          return;
        }

        setFormations(
          data.formations
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
        if (annule) {
          return;
        }

        console.error(
          "Erreur formations admin :",
          err
        );

        if (
          axios.isAxiosError(err)
        ) {
          setError(
            err.response?.data?.message ??
              "Impossible de charger les formations."
          );
        } else {
          setError(
            "Impossible de charger les formations."
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

  // =====================================================
  // RECHERCHE
  // =====================================================

  async function handleRecherche(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await chargerFormations(
      1,
      recherche
    );
  }

  // =====================================================
  // CRÉATION
  // =====================================================

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nouvellesErreurs: Record<string, string> = {};

    if (titre.trim().length < 3) nouvellesErreurs.titre = "Au moins 3 caractères";
    if (!isValidPrix(prix))
      nouvellesErreurs.prix = "Prix obligatoire, supérieur à 0 (exemple : 50000)";

    if (Object.keys(nouvellesErreurs).length > 0) {
      setErreurs(nouvellesErreurs);
      return;
    }

    setErreurs({});

    try {
      setCreating(true);

      await createFormationAdmin({
        titre: titre.trim(),
        ...(description.trim() && { description: description.trim() }),
        prix: Number(prix),
      });

      setTitre("");
      setDescription("");
      setPrix("");
      setShowCreateForm(false);

      await chargerFormations(1, recherche);

      window.alert("Formation créée avec succès.");
    } catch (err: unknown) {
      console.error("Erreur création formation :", err);

      if (axios.isAxiosError(err)) {
        window.alert(
          err.response?.data?.message ?? "Impossible de créer la formation."
        );
      } else {
        window.alert("Impossible de créer la formation.");
      }
    } finally {
      setCreating(false);
    }
  }

  // =====================================================
  // OUVRIR MODIFICATION
  // =====================================================

  function ouvrirModification(
    formation: FormationAdmin
  ) {
    setFormationAModifier(
      formation
    );

    setEditTitre(
      formation.titre
    );

    setEditDescription(
      formation.description ?? ""
    );

    // Les anciennes formations ont 0 : on laisse vide pour forcer un vrai prix
    setEditPrix(
      Number(formation.prix) > 0
        ? String(Number(formation.prix))
        : ""
    );

    setErreursEdit({});
  }

  // =====================================================
  // MODIFIER
  // =====================================================

  async function handleUpdate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !formationAModifier
    ) {
      return;
    }

    const nouvellesErreurs: Record<string, string> = {};

    if (editTitre.trim().length < 3) nouvellesErreurs.titre = "Au moins 3 caractères";
    if (!isValidPrix(editPrix))
      nouvellesErreurs.prix = "Prix obligatoire, supérieur à 0 (exemple : 50000)";

    if (Object.keys(nouvellesErreurs).length > 0) {
      setErreursEdit(nouvellesErreurs);
      return;
    }

    setErreursEdit({});

    try {
      setUpdating(true);

      await updateFormationAdmin(
        formationAModifier.id,
        {
          titre:
            editTitre.trim(),

          description:
            editDescription.trim()
              ? editDescription.trim()
              : null,

          prix: Number(editPrix),
        }
      );

      setFormationAModifier(
        null
      );

      await chargerFormations(
        page,
        recherche
      );

      window.alert(
        "Formation modifiée avec succès."
      );
    } catch (err: unknown) {
      console.error(
        "Erreur modification formation :",
        err
      );

      if (
        axios.isAxiosError(err)
      ) {
        window.alert(
          err.response?.data?.message ??
            "Impossible de modifier la formation."
        );
      } else {
        window.alert(
          "Impossible de modifier la formation."
        );
      }
    } finally {
      setUpdating(false);
    }
  }

  // =====================================================
  // SUPPRESSION
  // =====================================================

  async function handleDelete(
    formation: FormationAdmin
  ) {
    const contientDesDonnees =
      formation._count.cours > 0 ||
      formation._count.sessions > 0 ||
      formation._count.affectations > 0 ||
      formation._count.inscriptions > 0;

    if (contientDesDonnees) {
      window.alert(
        "Cette formation contient encore des cours, sessions, affectations ou inscriptions. Elle ne peut pas être supprimée."
      );

      return;
    }

    const confirmation =
      window.confirm(
        `Supprimer définitivement la formation "${formation.titre}" ?`
      );

    if (!confirmation) {
      return;
    }

    try {
      setDeletingId(
        formation.id
      );

      const resultat =
        await deleteFormationAdmin(
          formation.id
        );

      window.alert(
        resultat.message
      );

      await chargerFormations(
        page,
        recherche
      );
    } catch (err: unknown) {
      console.error(
        "Erreur suppression formation :",
        err
      );

      if (
        axios.isAxiosError(err)
      ) {
        window.alert(
          err.response?.data?.message ??
            "Impossible de supprimer la formation."
        );
      } else {
        window.alert(
          "Impossible de supprimer la formation."
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
                Formations
              </h1>

              <p className="mt-2 text-slate-600">
                Créez, modifiez et gérez les formations.
              </p>

              <p className="mt-3 text-sm text-slate-500">
                {total} formation
                {total > 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowCreateForm(
                  (value) => !value
                )
              }
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              {showCreateForm
                ? "Fermer"
                : "Nouvelle formation"}
            </button>
          </div>
        </header>

        {/* FORMULAIRE CRÉATION */}

        {showCreateForm && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Créer une formation
            </h2>

            <form
              onSubmit={handleCreate}
              noValidate
              className="mt-6 space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Titre
                </label>

                <input
                  type="text"
                  value={titre}
                  onChange={(event) => {
                    setTitre(event.target.value);
                    setErreurs((prev) => ({ ...prev, titre: "" }));
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
                />

                {erreurs.titre && (
                  <p className="mt-1 text-sm text-red-600">{erreurs.titre}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Prix
                </label>

                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Exemple : 50000"
                  value={prix}
                  onChange={(event) => {
                    setPrix(onlyPrix(event.target.value));
                    setErreurs((prev) => ({ ...prev, prix: "" }));
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
                />

                {erreurs.prix && (
                  <p className="mt-1 text-sm text-red-600">{erreurs.prix}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  value={
                    description
                  }
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(
                      false
                    );

                    setTitre("");
                    setDescription("");
                    setPrix("");
                    setErreurs({});
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
                    ? "Création..."
                    : "Créer"}
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
              placeholder="Titre ou description..."
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

                  void chargerFormations(
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

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* TABLEAU */}

        {loading ? (
          <div className="mt-8 text-slate-500">
            Chargement des formations...
          </div>
        ) : formations.length ===
          0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
            Aucune formation.
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">

                <thead className="bg-slate-950">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-white">
                      Formation
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-white">
                      Prix
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-white">
                      Créateur
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase text-white">
                      Cours
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase text-white">
                      Sessions
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase text-white">
                      Formateurs
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase text-white">
                      Inscriptions
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-white">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {formations.map(
                    (formation) => (
                      <tr
                        key={
                          formation.id
                        }
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                        <Link
                            to={`/admin/formations/${formation.id}`}
                            className="font-semibold text-slate-900 transition hover:text-cyan-700"
                            >
                            {formation.titre}
                        </Link>

                          {formation.description && (
                            <p className="mt-1 max-w-xs truncate text-sm text-slate-500">
                              {
                                formation.description
                              }
                            </p>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                          {formatPrix(formation.prix)}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {
                            formation.createur
                              .prenom
                          }{" "}
                          {
                            formation.createur
                              .nom
                          }
                        </td>

                        <td className="px-5 py-4 text-center text-sm">
                          {
                            formation._count
                              .cours
                          }
                        </td>

                        <td className="px-5 py-4 text-center text-sm">
                          {
                            formation._count
                              .sessions
                          }
                        </td>

                        <td className="px-5 py-4 text-center text-sm">
                          {
                            formation._count
                              .affectations
                          }
                        </td>

                        <td className="px-5 py-4 text-center text-sm">
                          {
                            formation._count
                              .inscriptions
                          }
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                ouvrirModification(
                                  formation
                                )
                              }
                              className="rounded-lg border border-cyan-200 px-3 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50"
                            >
                              Modifier
                            </button>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                formation.id
                              }
                              onClick={() =>
                                handleDelete(
                                  formation
                                )
                              }
                              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId ===
                              formation.id
                                ? "Suppression..."
                                : "Supprimer"}
                            </button>
                          </div>
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
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                disabled={
                  page <= 1
                }
                onClick={() =>
                  void chargerFormations(
                    page - 1,
                    recherche
                  )
                }
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40"
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
                  void chargerFormations(
                    page + 1,
                    recherche
                  )
                }
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Suivant →
              </button>
            </div>
          )}

        {/* MODAL MODIFICATION */}

        {formationAModifier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-slate-900">
                Modifier la formation
              </h2>

              <form
                onSubmit={handleUpdate}
                noValidate
                className="mt-6 space-y-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Titre
                  </label>

                  <input
                    type="text"
                    value={
                      editTitre
                    }
                    onChange={(event) => {
                      setEditTitre(event.target.value);
                      setErreursEdit((prev) => ({ ...prev, titre: "" }));
                    }}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
                  />

                  {erreursEdit.titre && (
                    <p className="mt-1 text-sm text-red-600">{erreursEdit.titre}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Prix
                  </label>

                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Exemple : 50000"
                    value={editPrix}
                    onChange={(event) => {
                      setEditPrix(onlyPrix(event.target.value));
                      setErreursEdit((prev) => ({ ...prev, prix: "" }));
                    }}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
                  />

                  {erreursEdit.prix && (
                    <p className="mt-1 text-sm text-red-600">{erreursEdit.prix}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    value={
                      editDescription
                    }
                    onChange={(event) =>
                      setEditDescription(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    disabled={
                      updating
                    }
                    onClick={() =>
                      setFormationAModifier(
                        null
                      )
                    }
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    disabled={
                      updating
                    }
                    className="rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {updating
                      ? "Modification..."
                      : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FormationsAdminPage;