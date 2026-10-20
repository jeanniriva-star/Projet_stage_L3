import type {
  FormationUtilisateur,
  UserAdmin,
} from "../../../types/user.types";
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
  "Formations",
  "Créé le",
];

// Au-delà, les formations sont regroupées dans une pastille "+N"
const MAX_FORMATIONS_VISIBLES = 2;

const STATUT_LABEL = {
  VALIDEE: "Validée",
  EN_ATTENTE: "En attente",
  REFUSEE: "Refusée",
} as const;

function pastilleClass(formation: FormationUtilisateur) {
  switch (formation.statut) {
    case "VALIDEE":
      return "bg-emerald-50 text-emerald-700";
    case "EN_ATTENTE":
      return "bg-amber-50 text-amber-700";
    case "REFUSEE":
      return "bg-red-50 text-red-700";
    default:
      return "bg-cyan-50 text-cyan-700";
  }
}

function FormationsCell({
  formations,
}: {
  formations?: FormationUtilisateur[];
}) {
  if (!formations || formations.length === 0) {
    return <span className="text-sm text-slate-400">Aucune</span>;
  }

  const visibles = formations.slice(0, MAX_FORMATIONS_VISIBLES);
  const restantes = formations.slice(MAX_FORMATIONS_VISIBLES);

  return (
    <div className="flex max-w-xs flex-wrap gap-1.5">
      {visibles.map((formation) => (
        <span
          key={formation.id}
          title={
            formation.statut
              ? `${formation.titre} (${STATUT_LABEL[formation.statut]})`
              : formation.titre
          }
          className={`inline-block max-w-[11rem] truncate rounded-full px-2.5 py-1 text-xs font-semibold ${pastilleClass(
            formation
          )}`}
        >
          {formation.titre}
        </span>
      ))}

      {restantes.length > 0 && (
        <span
          title={restantes.map((formation) => formation.titre).join(", ")}
          className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
        >
          +{restantes.length}
        </span>
      )}
    </div>
  );
}

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

                <td className="px-5 py-4">
                  <FormationsCell formations={utilisateur.formations} />
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