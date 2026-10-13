import type { FormEvent } from "react";

import {
  useFormationForm,
  valeursDepuisFormation,
  type FormationFormValues,
} from "../../../hooks/admin/useFormationForm";
import type { FormationAdmin } from "../../../services/formation.service";
import FormationForm from "./FormationForm";

type Props = {
  formation: FormationAdmin;
  updating: boolean;
  onModifier: (valeurs: FormationFormValues) => void;
  onFermer: () => void;
};

function FormationEditModal({
  formation,
  updating,
  onModifier,
  onFermer,
}: Props) {
  const form = useFormationForm(valeursDepuisFormation(formation));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.valider()) {
      return;
    }

    onModifier(form.valeurs);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900">
          Modifier la formation
        </h2>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <FormationForm form={form} />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={updating}
              onClick={onFermer}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={updating}
              className="rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {updating ? "Modification..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormationEditModal;