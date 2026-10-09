import type {
  PresenceApprenant,
  PresencesSessionResponse,
} from "../../../types/session.types";

interface PresenceColumnProps {
  titre: string;
  presences: PresenceApprenant[];
  messageVide: string;
}

function PresenceColumn({ titre, presences, messageVide }: PresenceColumnProps) {
  return (
    <div>
      <h4 className="font-bold text-slate-900">{titre}</h4>

      {presences.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">{messageVide}</p>
      ) : (
        <div className="mt-3 space-y-2">
          {presences.map((presence) => (
            <div
              key={presence.id}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <p className="text-sm font-semibold text-slate-800">
                {presence.inscription.apprenant.prenom}{" "}
                {presence.inscription.apprenant.nom}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {presence.inscription.apprenant.email}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface PresenceDetailsProps {
  details: PresencesSessionResponse;
}

function PresenceDetails({ details }: PresenceDetailsProps) {
  const presents = details.presences.filter((presence) => presence.present);
  const absents = details.presences.filter((presence) => !presence.present);

  return (
    <div className="mt-5 border-t border-slate-200 pt-5">
      <div className="flex flex-wrap gap-5 text-sm">
        <span className="font-semibold text-emerald-700">
          Présents : {details.statistiques.presents}
        </span>

        <span className="font-semibold text-red-700">
          Absents : {details.statistiques.absents}
        </span>

        <span className="font-semibold text-slate-600">
          Total : {details.statistiques.total}
        </span>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <PresenceColumn
          titre="Présents"
          presences={presents}
          messageVide="Aucun apprenant présent."
        />

        <PresenceColumn
          titre="Absents"
          presences={absents}
          messageVide="Aucun apprenant absent."
        />
      </div>
    </div>
  );
}

export default PresenceDetails;