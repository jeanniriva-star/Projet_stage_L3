import type { UserAdmin } from "../../../types/user.types";

interface DeleteConfirmModalProps {
  utilisateur: UserAdmin;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function DeleteConfirmModal({
  utilisateur,
  deleting,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-700">
          !
        </div>

        <h2 className="mt-4 text-xl font-bold text-slate-900">
          Confirmer la suppression
        </h2>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          Voulez-vous vraiment supprimer définitivement cet utilisateur ?
        </p>

        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="font-semibold text-slate-900">
            {utilisateur.prenom} {utilisateur.nom}
          </p>

          <p className="mt-1 text-sm text-slate-500">{utilisateur.email}</p>
        </div>

        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            Cette action sera définitive et irréversible.
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={deleting}
            onClick={onCancel}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Annuler
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "Suppression..." : "Confirmer la suppression"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;