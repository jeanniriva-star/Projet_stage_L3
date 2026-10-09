import type { UserAdmin } from "../../../types/user.types";
import { formatDate, roleClass, roleLabel } from "../../../utils/userHelpers";

interface UsersTableProps {
  utilisateurs: UserAdmin[];
  onDelete: (utilisateur: UserAdmin) => void;
}

const COLONNES = [
  "Utilisateur",
  "Email",
  "Téléphone",
  "Adresse",
  "Rôle",
  "Créé le",
];

function UsersTable({ utilisateurs, onDelete }: UsersTableProps) {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-950">
            <tr>
              {COLONNES.map((colonne) => (
                <th
                  key={colonne}
                  className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white"
                >
                  {colonne}
                </th>
              ))}

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-white">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {utilisateurs.map((utilisateur) => (
              <tr key={utilisateur.id} className="transition hover:bg-slate-50">
                <td className="whitespace-nowrap px-5 py-4">
                  <p className="font-semibold text-slate-900">
                    {utilisateur.prenom} {utilisateur.nom}
                  </p>
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {utilisateur.email}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  {utilisateur.telephone}
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {utilisateur.adresse}
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleClass(
                      utilisateur.role
                    )}`}
                  >
                    {roleLabel(utilisateur.role)}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                  {formatDate(utilisateur.createdAt)}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onDelete(utilisateur)}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersTable;