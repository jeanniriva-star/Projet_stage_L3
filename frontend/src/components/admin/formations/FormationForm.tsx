import type { useFormationForm } from "../../../hooks/admin/useFormationForm";
import type { TypeFormation } from "../../../services/formation.service";
import { NIVEAUX } from "../../../utils/format";

export type FormationFormState = ReturnType<typeof useFormationForm>;

type Props = {
  form: FormationFormState;
};

function FormationForm({ form }: Props) {
  const { valeurs, erreurs, setChamp } = form;

  return (
    <>
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Type de formation
        </label>

        <select
          value={valeurs.type}
          onChange={(event) =>
            setChamp("type", event.target.value as TypeFormation)
          }
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-600"
        >
          <option value="PROFESSIONNELLE">Formation professionnelle</option>
          <option value="CONTINUE">
            Formation continue (matière universitaire)
          </option>
        </select>
      </div>

      {valeurs.type === "CONTINUE" && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Niveau
          </label>

          <select
            value={valeurs.niveau}
            onChange={(event) => setChamp("niveau", event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-600"
          >
            <option value="">Choisir un niveau</option>
            {NIVEAUX.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          {erreurs.niveau && (
            <p className="mt-1 text-sm text-red-600">{erreurs.niveau}</p>
          )}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Titre
        </label>

        <input
          type="text"
          value={valeurs.titre}
          onChange={(event) => setChamp("titre", event.target.value)}
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
          value={valeurs.prix}
          onChange={(event) => setChamp("prix", event.target.value)}
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
          value={valeurs.description}
          onChange={(event) => setChamp("description", event.target.value)}
          rows={4}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
        />
      </div>
    </>
  );
}

export default FormationForm;