import type { FormEvent } from "react";

import FormationForm, { type FormationFormState } from "./FormationForm";

type Props = {
  form: FormationFormState;
  creating: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onAnnuler: () => void;
};

function FormationCreateSection({
  form,
  creating,
  onSubmit,
  onAnnuler,
}: Props) {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Créer une formation</h2>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
        <FormationForm form={form} />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onAnnuler}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={creating}
            className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {creating ? "Création..." : "Créer"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default FormationCreateSection;