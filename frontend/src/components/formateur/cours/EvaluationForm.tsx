import type { EvaluationFormState } from "../../../hooks/useEvaluationForm";

type Props = {
  form: EvaluationFormState;
};

function EvaluationForm({ form }: Props) {
  return (
    <form
      onSubmit={form.submit}
      className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
        QCM
      </p>

      <h3 className="mt-2 text-lg font-bold text-slate-900">
        Nouvelle évaluation
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Créez d'abord le QCM. Les questions seront ajoutées ensuite.
      </p>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Titre
        </label>

        <input
          type="text"
          value={form.titre}
          onChange={(event) => form.setTitre(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Description
        </label>

        <textarea
          value={form.description}
          onChange={(event) => form.setDescription(event.target.value)}
          rows={4}
          className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3"
        />
      </div>

      {form.error && <p className="mt-4 text-sm text-red-600">{form.error}</p>}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={form.annuler}
          className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold"
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={form.saving}
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {form.saving ? "Création..." : "Créer le QCM"}
        </button>
      </div>
    </form>
  );
}

export default EvaluationForm;