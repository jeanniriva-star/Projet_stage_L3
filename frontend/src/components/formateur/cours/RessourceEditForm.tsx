import type { RessourceEdition } from "../../../hooks/useRessourcesFormateur";
import type { RessourceCours } from "../../../services/ressource.service";
import type { TypeRessourceUrl } from "../../../types/ressource-form.types";
import { estFichier } from "../../../utils/ressource.utils";

type Props = {
  ressource: RessourceCours;
  edition: RessourceEdition;
};

function RessourceEditForm({ ressource, edition }: Props) {
  const fichier = estFichier(ressource);

  return (
    <form
      onSubmit={(event) => edition.submit(event, ressource.id)}
      className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5"
    >
      <h4 className="font-semibold text-slate-900">Modifier la ressource</h4>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Nom
        </label>

        <input
          type="text"
          value={edition.nom}
          onChange={(event) => edition.setNom(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-cyan-600"
        />
      </div>

      {!fichier && (
        <>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Type
            </label>

            <select
              value={edition.type}
              onChange={(event) =>
                edition.setType(event.target.value as TypeRessourceUrl)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
            >
              <option value="VIDEO">Vidéo</option>
              <option value="LIEN">Lien externe</option>
            </select>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              URL
            </label>

            <input
              type="url"
              value={edition.url}
              onChange={(event) => edition.setUrl(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
            />
          </div>
        </>
      )}

      {fichier && (
        <p className="mt-3 text-xs text-slate-500">
          Pour remplacer le fichier, supprimez cette ressource puis importez-en
          une nouvelle.
        </p>
      )}

      {edition.error && (
        <p className="mt-4 text-sm text-red-600">{edition.error}</p>
      )}

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={edition.annuler}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={edition.saving}
          className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {edition.saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

export default RessourceEditForm;