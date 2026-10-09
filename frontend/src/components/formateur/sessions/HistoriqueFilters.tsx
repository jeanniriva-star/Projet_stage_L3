import type { FormationAffectee } from "../../../services/affectation.service";
import {
  FILTRES_VIDES,
  type FiltresHistorique,
} from "../../../utils/sessionHelpers";

interface HistoriqueFiltersProps {
  filtres: FiltresHistorique;
  formations: FormationAffectee[];
  nombreResultats: number;
  onChange: (filtres: FiltresHistorique) => void;
}

const labelClass = "mb-2 block text-sm font-semibold text-slate-700";
const fieldClass =
  "w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-600";

function HistoriqueFilters({
  filtres,
  formations,
  nombreResultats,
  onChange,
}: HistoriqueFiltersProps) {
  const filtresActifs = filtres.recherche || filtres.formationId || filtres.date;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-3">
        <div>
          <label htmlFor="historique-recherche" className={labelClass}>
            Rechercher
          </label>

          <input
            id="historique-recherche"
            type="search"
            value={filtres.recherche}
            onChange={(event) =>
              onChange({ ...filtres, recherche: event.target.value })
            }
            placeholder="Titre de session..."
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="historique-formation" className={labelClass}>
            Formation
          </label>

          <select
            id="historique-formation"
            value={filtres.formationId}
            onChange={(event) =>
              onChange({ ...filtres, formationId: event.target.value })
            }
            className={`${fieldClass} bg-white`}
          >
            <option value="">Toutes les formations</option>

            {formations.map((affectation) => (
              <option
                key={affectation.formation.id}
                value={affectation.formation.id}
              >
                {affectation.formation.titre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="historique-date" className={labelClass}>
            Date
          </label>

          <input
            id="historique-date"
            type="date"
            value={filtres.date}
            onChange={(event) =>
              onChange({ ...filtres, date: event.target.value })
            }
            className={fieldClass}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {nombreResultats} résultat{nombreResultats > 1 ? "s" : ""}
        </p>

        {filtresActifs && (
          <button
            type="button"
            onClick={() => onChange(FILTRES_VIDES)}
            className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>
    </div>
  );
}

export default HistoriqueFilters;