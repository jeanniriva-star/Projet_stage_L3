import { useRessourcesFormateur } from "../../../hooks/useRessourcesFormateur";
import type { RessourceCours } from "../../../services/ressource.service";
import RessourceForm from "./RessourceForm";
import RessourceItem from "./RessourceItem";

type Props = {
  coursId: string | undefined;
  ressources: RessourceCours[];
  rechargerRessources: () => Promise<void>;
};

function RessourcesSection({
  coursId,
  ressources,
  rechargerRessources,
}: Props) {
  const {
    showRessources,
    toggleRessources,
    downloadingId,
    supprimer,
    telecharger,
    ajout,
    edition,
  } = useRessourcesFormateur(coursId, ressources, rechargerRessources);

  return (
    <section className="mt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Ressources pédagogiques
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Documents, vidéos et liens associés à ce cours.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={toggleRessources}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {showRessources
              ? "Masquer les ressources"
              : "Afficher les ressources"}
          </button>

          <button
            type="button"
            onClick={ajout.toggle}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            {ajout.visible ? "Fermer" : "Ajouter une ressource"}
          </button>
        </div>
      </div>

      {ajout.visible && <RessourceForm ajout={ajout} />}

      {showRessources &&
        (ressources.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8">
            <p className="text-sm text-slate-600">
              Aucune ressource ajoutée pour ce cours.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {ressources.map((ressource) => (
              <RessourceItem
                key={ressource.id}
                ressource={ressource}
                edition={edition}
                downloadingId={downloadingId}
                onTelecharger={telecharger}
                onSupprimer={supprimer}
              />
            ))}
          </div>
        ))}
    </section>
  );
}

export default RessourcesSection;