import type {
  PresencesSessionResponse,
  SessionAvecFormation,
} from "../../../types/session.types";
import { formatDateTime } from "../../../utils/dates";
import PresenceDetails from "./PresenceDetails";

interface SessionHistoriqueCardProps {
  session: SessionAvecFormation;
  details: PresencesSessionResponse | undefined;
  ouvert: boolean;
  loading: boolean;
  onTogglePresences: (sessionId: string) => void;
}

function SessionHistoriqueCard({
  session,
  details,
  ouvert,
  loading,
  onTogglePresences,
}: SessionHistoriqueCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            {session.formation.titre}
          </p>

          <h3 className="mt-1 font-bold text-slate-800">{session.titre}</h3>

          {session.description && (
            <p className="mt-2 text-sm text-slate-600">{session.description}</p>
          )}

          <div className="mt-3 space-y-1 text-sm text-slate-500">
            <p>{formatDateTime(session.dateDebut)}</p>

            <p>Présences enregistrées : {session._count.presences}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />

          <span className="text-sm font-medium text-slate-500">Terminée</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onTogglePresences(session.id)}
        disabled={loading}
        className="mt-4 text-sm font-semibold text-cyan-700 transition hover:text-cyan-900 disabled:opacity-50"
      >
        {loading
          ? "Chargement..."
          : ouvert
          ? "Masquer les présences"
          : "Voir les présences"}
      </button>

      {ouvert && details && <PresenceDetails details={details} />}
    </article>
  );
}

export default SessionHistoriqueCard;