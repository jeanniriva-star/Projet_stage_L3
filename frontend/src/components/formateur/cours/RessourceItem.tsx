import type { RessourceEdition } from "../../../hooks/useRessourcesFormateur";
import type { RessourceCours } from "../../../services/ressource.service";
import { estFichier } from "../../../utils/ressource.utils";
import RessourceEditForm from "./RessourceEditForm";

type Props = {
  ressource: RessourceCours;
  edition: RessourceEdition;
  downloadingId: string | null;
  onTelecharger: (ressource: RessourceCours) => void;
  onSupprimer: (ressourceId: string) => void;
};

function RessourceItem({
  ressource,
  edition,
  downloadingId,
  onTelecharger,
  onSupprimer,
}: Props) {
  const fichier = estFichier(ressource);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
            {ressource.type}
          </p>

          <h3 className="mt-2 font-bold text-slate-900">{ressource.nom}</h3>

          <p className="mt-1 text-xs text-slate-500">
            Ajouté le{" "}
            {new Date(ressource.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {fichier ? (
            <button
              type="button"
              onClick={() => onTelecharger(ressource)}
              disabled={downloadingId === ressource.id}
              className="rounded-xl border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:opacity-50"
            >
              {downloadingId === ressource.id
                ? "Téléchargement..."
                : "Télécharger"}
            </button>
          ) : (
            <a
              href={ressource.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Ouvrir
            </a>
          )}

          <button
            type="button"
            onClick={() => edition.commencer(ressource)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Modifier
          </button>

          <button
            type="button"
            onClick={() => onSupprimer(ressource.id)}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Supprimer
          </button>
        </div>
      </div>

      {edition.editingId === ressource.id && (
        <RessourceEditForm ressource={ressource} edition={edition} />
      )}
    </article>
  );
}

export default RessourceItem;