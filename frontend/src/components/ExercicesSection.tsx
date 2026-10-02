import { useEffect, useState } from "react";
import {
  getExercicesCours,
  uploadExerciceFichier,
  deleteExercice,
  downloadExercice,
  type ExerciceCours,
} from "../services/exercice.service";

interface ExercicesSectionProps {
  coursId: string;
  isFormateur: boolean;
}

function ExercicesSection({ coursId, isFormateur }: ExercicesSectionProps) {
  const [exercices, setExercices] = useState<ExerciceCours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function charger() {
      try {
        const data = await getExercicesCours(coursId);
        setExercices(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les exercices.");
      } finally {
        setLoading(false);
      }
    }
    charger();
  }, [coursId]);

  async function recharger() {
    const data = await getExercicesCours(coursId);
    setExercices(data);
  }

  async function handleAjouter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!fichier) {
      setFormError("Veuillez sélectionner un fichier PDF.");
      return;
    }

    if (fichier.size > 20 * 1024 * 1024) {
      setFormError("Le fichier dépasse la taille maximale de 20 Mo.");
      return;
    }

    try {
      setSaving(true);
      await uploadExerciceFichier(coursId, fichier, titre, description);
      await recharger();
      setTitre("");
      setDescription("");
      setFichier(null);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setFormError("Impossible d'ajouter l'exercice.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSupprimer(exerciceId: string) {
    if (!window.confirm("Supprimer cet exercice ?")) return;
    try {
      setDeletingId(exerciceId);
      await deleteExercice(exerciceId);
      await recharger();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleTelecharger(exercice: ExerciceCours) {
    try {
      setDownloadingId(exercice.id);
      await downloadExercice(exercice.id, `${exercice.titre}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  }

  if (loading) {
    return (
      <section className="mt-12 border-t border-slate-200 pt-10">
        <p className="text-sm text-slate-500">Chargement des exercices...</p>
      </section>
    );
  }

  return (
    <section className="mt-12 border-t border-slate-200 pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Exercices</h2>
          <p className="mt-1 text-sm text-slate-500">
            Fichiers PDF d'exercices associés à ce cours.
          </p>
        </div>

        {isFormateur && (
          <button
            type="button"
            onClick={() => setShowForm((c) => !c)}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            {showForm ? "Fermer" : "Ajouter un exercice"}
          </button>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {isFormateur && showForm && (
        <form
          onSubmit={handleAjouter}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Titre</label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex: Exercice 1 - Boucles"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Fichier PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>

          {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Envoi..." : "Ajouter"}
            </button>
          </div>
        </form>
      )}

      {exercices.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8">
          <p className="text-sm text-slate-600">Aucun exercice disponible pour ce cours.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {exercices.map((exercice) => (
            <article
              key={exercice.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                    PDF
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">{exercice.titre}</h3>
                  {exercice.description && (
                    <p className="mt-2 text-sm text-slate-600">{exercice.description}</p>
                  )}
                  <p className="mt-2 text-sm text-slate-500">
                    Ajouté le {new Date(exercice.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
                  📝
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => handleTelecharger(exercice)}
                  disabled={downloadingId === exercice.id}
                  className="inline-flex items-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloadingId === exercice.id ? "Téléchargement..." : "Télécharger"}
                </button>

                {isFormateur && (
                  <button
                    type="button"
                    onClick={() => handleSupprimer(exercice.id)}
                    disabled={deletingId === exercice.id}
                    className="inline-flex items-center rounded-xl border border-red-300 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === exercice.id ? "..." : "Supprimer"}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ExercicesSection;