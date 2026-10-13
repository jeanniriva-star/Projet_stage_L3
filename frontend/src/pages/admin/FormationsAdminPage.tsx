import { useState, type FormEvent } from "react";

import FormationCreateSection from "../../components/admin/formations/FormationCreateSection";
import FormationEditModal from "../../components/admin/formations/FormationEditModal";
import FormationsTable from "../../components/admin/formations/FormationsTable";
import { useFormationForm } from "../../hooks/admin/useFormationForm";
import { useFormationsAdmin } from "../../hooks/admin/useFormationsAdmin";
import type { FormationAdmin } from "../../services/formation.service";

function FormationsAdminPage() {
  const {
    formations,
    loading,
    error,
    recherche,
    setRecherche,
    page,
    totalPages,
    total,
    creating,
    updating,
    deletingId,
    chargerFormations,
    handleRecherche,
    reinitialiserRecherche,
    creer,
    modifier,
    supprimer,
  } = useFormationsAdmin();

  const createForm = useFormationForm();

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formationAModifier, setFormationAModifier] =
    useState<FormationAdmin | null>(null);

  function annulerCreation() {
    setShowCreateForm(false);
    createForm.reset();
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!createForm.valider()) {
      return;
    }

    void creer(createForm.valeurs, () => {
      createForm.reset();
      setShowCreateForm(false);
    });
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
              <h1 className="text-3xl font-bold text-slate-900">Formations</h1>

              <p className="mt-2 text-slate-600">
                Créez, modifiez et gérez les formations.
              </p>

              <p className="mt-3 text-sm text-slate-500">
                {total} formation{total > 1 ? "s" : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateForm((value) => !value)}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              {showCreateForm ? "Fermer" : "Nouvelle formation"}
            </button>
          </div>
        </header>

        {/* CRÉATION */}

        {showCreateForm && (
          <FormationCreateSection
            form={createForm}
            creating={creating}
            onSubmit={handleCreate}
            onAnnuler={annulerCreation}
          />
        )}

        {/* RECHERCHE */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form
            onSubmit={handleRecherche}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="search"
              value={recherche}
              onChange={(event) => setRecherche(event.target.value)}
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
                onClick={reinitialiserRecherche}
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
        ) : formations.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
            Aucune formation.
          </div>
        ) : (
          <FormationsTable
            formations={formations}
            deletingId={deletingId}
            onModifier={setFormationAModifier}
            onSupprimer={supprimer}
          />
        )}

        {/* PAGINATION */}

        {!loading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => void chargerFormations(page - 1, recherche)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              ← Précédent
            </button>

            <p className="text-sm text-slate-500">
              Page {page} sur {totalPages}
            </p>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => void chargerFormations(page + 1, recherche)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              Suivant →
            </button>
          </div>
        )}

        {/* MODALE MODIFICATION */}

        {formationAModifier && (
          <FormationEditModal
            key={formationAModifier.id}
            formation={formationAModifier}
            updating={updating}
            onModifier={(valeurs) =>
              modifier(formationAModifier.id, valeurs, () =>
                setFormationAModifier(null)
              )
            }
            onFermer={() => setFormationAModifier(null)}
          />
        )}
      </div>
    </div>
  );
}

export default FormationsAdminPage;