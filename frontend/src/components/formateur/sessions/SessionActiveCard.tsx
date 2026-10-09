import type { SessionAvecFormation } from "../../../types/session.types";
import { formatDateTime } from "../../../utils/dates";

interface SessionActiveCardProps {
  session: SessionAvecFormation;
  actionEnCours: boolean;
  onDemarrer: (sessionId: string) => void;
  onRejoindre: (sessionId: string) => void;
  onTerminer: (sessionId: string) => void;
}

function SessionActiveCard({
  session,
  actionEnCours,
  onDemarrer,
  onRejoindre,
  onTerminer,
}: SessionActiveCardProps) {
  const enCours = session.statut === "EN_COURS";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
              {session.formation.titre}
            </p>

            <h3 className="mt-2 text-xl font-bold text-slate-900">
              {session.titre}
            </h3>

            {session.description && (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {session.description}
              </p>
            )}

            <div className="mt-4 space-y-1 text-sm text-slate-500">
              <p>Début : {formatDateTime(session.dateDebut)}</p>
              <p>Fin : {formatDateTime(session.dateFin)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                enCours ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />

            <span className="text-sm font-medium text-slate-700">
              {enCours ? "En cours" : "Non démarrée"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {session.statut === "NON_DEMARREE" && (
            <button
              type="button"
              onClick={() => onDemarrer(session.id)}
              disabled={actionEnCours}
              className="rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionEnCours ? "Démarrage..." : "Démarrer la visioconférence"}
            </button>
          )}

          {enCours && (
            <>
              <button
                type="button"
                onClick={() => onRejoindre(session.id)}
                disabled={actionEnCours}
                className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionEnCours ? "Ouverture..." : "Rejoindre"}
              </button>

              <button
                type="button"
                onClick={() => onTerminer(session.id)}
                disabled={actionEnCours}
                className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Terminer
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default SessionActiveCard;