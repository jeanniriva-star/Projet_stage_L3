import { Link } from "react-router-dom";

import type { FormationAdmin } from "../../../services/formation.service";
import { formatPrix, formatType } from "../../../utils/format";

const COLONNES = [
  { label: "Formation", align: "text-left" },
  { label: "Type", align: "text-left" },
  { label: "Prix", align: "text-left" },
  { label: "Créateur", align: "text-left" },
  { label: "Cours", align: "text-center" },
  { label: "Sessions", align: "text-center" },
  { label: "Formateurs", align: "text-center" },
  { label: "Inscriptions", align: "text-center" },
  { label: "Actions", align: "text-right" },
];

type Props = {
  formations: FormationAdmin[];
  deletingId: string | null;
  onModifier: (formation: FormationAdmin) => void;
  onSupprimer: (formation: FormationAdmin) => void;
};

function FormationsTable({
  formations,
  deletingId,
  onModifier,
  onSupprimer,
}: Props) {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-950">
            <tr>
              {COLONNES.map((colonne) => (
                <th
                  key={colonne.label}
                  className={`px-5 py-4 ${colonne.align} text-xs font-semibold uppercase text-white`}
                >
                  {colonne.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {formations.map((formation) => (
              <tr key={formation.id} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <Link
                    to={`/admin/formations/${formation.id}`}
                    className="font-semibold text-slate-900 transition hover:text-cyan-700"
                  >
                    {formation.titre}
                  </Link>

                  {formation.description && (
                    <p className="mt-1 max-w-xs truncate text-sm text-slate-500">
                      {formation.description}
                    </p>
                  )}
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      formation.type === "CONTINUE"
                        ? "bg-cyan-100 text-cyan-700"
                        : "bg-violet-100 text-violet-700"
                    }`}
                  >
                    {formatType(formation.type)}
                    {formation.niveau ? ` · ${formation.niveau}` : ""}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                  {formatPrix(formation.prix)}
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {formation.createur.prenom} {formation.createur.nom}
                </td>

                <td className="px-5 py-4 text-center text-sm">
                  {formation._count.cours}
                </td>

                <td className="px-5 py-4 text-center text-sm">
                  {formation._count.sessions}
                </td>

                <td className="px-5 py-4 text-center text-sm">
                  {formation._count.affectations}
                </td>

                <td className="px-5 py-4 text-center text-sm">
                  {formation._count.inscriptions}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onModifier(formation)}
                      className="rounded-lg border border-cyan-200 px-3 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50"
                    >
                      Modifier
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === formation.id}
                      onClick={() => onSupprimer(formation)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === formation.id
                        ? "Suppression..."
                        : "Supprimer"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FormationsTable;