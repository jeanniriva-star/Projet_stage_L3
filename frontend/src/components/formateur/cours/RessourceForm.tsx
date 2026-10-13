import type { RessourceAjout } from "../../../hooks/useRessourcesFormateur";
import type { TypeRessourceUrl } from "../../../types/ressource-form.types";

type Props = {
  ajout: RessourceAjout;
};

function RessourceForm({ ajout }: Props) {
  const {
    mode,
    nom,
    type,
    url,
    fichier,
    saving,
    error,
    setNom,
    setType,
    setUrl,
    setFichier,
    changerMode,
    annuler,
    submit,
  } = ajout;

  return (
    <form
      onSubmit={submit}
      className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-lg font-bold text-slate-900">Nouvelle ressource</h3>

      <p className="mt-1 text-sm text-slate-500">
        Ajoutez un document, une vidéo ou un lien.
      </p>

      {/* CHOIX MODE */}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => changerMode("URL")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            mode === "URL"
              ? "bg-slate-950 text-white"
              : "border border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Vidéo / lien
        </button>

        <button
          type="button"
          onClick={() => changerMode("FICHIER")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            mode === "FICHIER"
              ? "bg-slate-950 text-white"
              : "border border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Importer un document
        </button>
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Nom de la ressource
          {mode === "FICHIER" && (
            <span className="ml-1 font-normal text-slate-400">(optionnel)</span>
          )}
        </label>

        <input
          type="text"
          value={nom}
          onChange={(event) => setNom(event.target.value)}
          placeholder={
            mode === "FICHIER"
              ? "Laisser vide pour utiliser le nom du fichier"
              : "Ex : Introduction à React"
          }
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-600"
        />
      </div>

      {mode === "URL" ? (
        <>
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Type
            </label>

            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value as TypeRessourceUrl)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-cyan-600"
            >
              <option value="VIDEO">Vidéo</option>
              <option value="LIEN">Lien externe</option>
            </select>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              URL
            </label>

            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder={
                type === "VIDEO" ? "https://www.youtube.com/..." : "https://..."
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-600"
            />
          </div>
        </>
      ) : (
        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Fichier
          </label>

          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            onChange={(event) => setFichier(event.target.files?.[0] ?? null)}
            className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700"
          />

          <p className="mt-2 text-xs text-slate-500">
            PDF, Word ou PowerPoint — 20 Mo maximum.
          </p>

          {fichier && (
            <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Fichier sélectionné :{" "}
              <span className="font-semibold">{fichier.name}</span>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={annuler}
          className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? mode === "FICHIER"
              ? "Importation..."
              : "Ajout..."
            : mode === "FICHIER"
            ? "Importer le fichier"
            : "Ajouter la ressource"}
        </button>
      </div>
    </form>
  );
}

export default RessourceForm;