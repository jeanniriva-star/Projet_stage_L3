import type { UserAdmin } from "../../../types/user.types";
import { roleClass, roleLabel } from "../../../utils/userHelpers";

interface DeleteWarningModalProps {
  utilisateur: UserAdmin;
  loadingVerification: boolean;
  onCancel: () => void;
  onVerify: () => void;
  onContinue: () => void;
}

function DeleteWarningModal({
  utilisateur,
  loadingVerification,
  onCancel,
  onVerify,
  onContinue,
}: DeleteWarningModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-xl font-bold text-amber-700">
          !
        </div>

        <h2 className="mt-4 text-xl font-bold text-slate-900">
          Vérification recommandée
        </h2>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          Cet utilisateur peut être toujours en activité sur la plateforme.
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Vérifiez ses données et ses éventuelles activités avant de continuer
          la suppression.
        </p>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-900">
            {utilisateur.prenom} {utilisateur.nom}
          </p>

          <p className="mt-1 text-sm text-slate-500">{utilisateur.email}</p>

          <span
            className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleClass(
              utilisateur.role
            )}`}
          >
            {roleLabel(utilisateur.role)}
          </span>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onVerify}
            disabled={loadingVerification}
            className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingVerification ? "Vérification..." : "Vérifier"}
          </button>

          <button
            type="button"
            onClick={onContinue}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteWarningModal;