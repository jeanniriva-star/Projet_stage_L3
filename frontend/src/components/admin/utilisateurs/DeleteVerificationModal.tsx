import type { DeleteCheckResponse } from "../../../types/user.types";
import {
  isDeleteCheckAdmin,
  isDeleteCheckApprenant,
  isDeleteCheckFormateur,
} from "../../../utils/userHelpers";

interface DeleteVerificationModalProps {
  data: DeleteCheckResponse;
  onClose: () => void;
  onContinue: () => void;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function DeleteVerificationModal({
  data,
  onClose,
  onContinue,
}: DeleteVerificationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900">
          Vérification des données
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {data.user.prenom} {data.user.nom}
        </p>

        {isDeleteCheckApprenant(data) && (
          <div className="mt-6 space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Inscriptions" value={data.dependances.inscriptions} />
              <Stat label="Présences" value={data.dependances.presences} />
              <Stat label="Progressions" value={data.dependances.progressions} />
              <Stat label="Soumissions" value={data.dependances.soumissions} />
            </div>

            {data.details.inscriptions.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900">
                  Formations concernées
                </h3>

                <div className="mt-3 space-y-2">
                  {data.details.inscriptions.map((inscription) => (
                    <div
                      key={inscription.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <p className="font-medium text-slate-900">
                        {inscription.formation.titre}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Statut : {inscription.statut}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isDeleteCheckFormateur(data) && (
          <div className="mt-6">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Affectations</p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {data.dependances.affectations}
              </p>
            </div>

            {data.details.affectations.length > 0 && (
              <div className="mt-5">
                <h3 className="font-semibold text-slate-900">
                  Formations affectées
                </h3>

                <div className="mt-3 space-y-2">
                  {data.details.affectations.map((affectation) => (
                    <div
                      key={affectation.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <p className="font-medium text-slate-900">
                        {affectation.formation.titre}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isDeleteCheckAdmin(data) && (
          <div className="mt-6">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Formations créées</p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {data.dependances.formationsCreees}
              </p>
            </div>

            {data.raison && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {data.raison}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
          >
            Fermer
          </button>

          {data.peutSupprimer && (
            <button
              type="button"
              onClick={onContinue}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Continuer la suppression
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DeleteVerificationModal;