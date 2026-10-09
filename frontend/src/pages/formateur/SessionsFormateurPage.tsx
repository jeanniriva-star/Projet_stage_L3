import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMesFormationsFormateur,
  type FormationAffectee,
} from "../../services/affectation.service";
import {
  getSessionsFormationFormateur,
  demarrerSession,
  rejoindreSession,
  terminerSession,
  creerSession,
  getPresencesSession,
} from "../../services/session.service";
import type {
  CreateSessionData,
  PresencesSessionResponse,
  SessionAvecFormation,
} from "../../types/session.types";
import ErrorAlert from "../../components/common/ErrorAlert";
import SessionCreateForm from "../../components/formateur/sessions/SessionCreateForm";
import SessionActiveCard from "../../components/formateur/sessions/SessionActiveCard";
import HistoriqueFilters from "../../components/formateur/sessions/HistoriqueFilters";
import SessionHistoriqueCard from "../../components/formateur/sessions/SessionHistoriqueCard";
import { getErrorMessage } from "../../utils/errors";
import {
  FILTRES_VIDES,
  filtrerHistorique,
  separerSessions,
  type FiltresHistorique,
} from "../../utils/sessionHelpers";

function SessionsFormateurPage() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<SessionAvecFormation[]>([]);
  const [formations, setFormations] = useState<FormationAffectee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showHistorique, setShowHistorique] = useState(false);
  const [sessionActionId, setSessionActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  // =========================
  // FILTRES HISTORIQUE
  // =========================

  const [filtresHistorique, setFiltresHistorique] =
    useState<FiltresHistorique>(FILTRES_VIDES);

  // =========================
  // CRÉATION DE SESSION
  // =========================

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // =========================
  // PRÉSENCES
  // =========================

  const [presencesParSession, setPresencesParSession] = useState<
    Record<string, PresencesSessionResponse | undefined>
  >({});
  const [sessionPresenceOuverte, setSessionPresenceOuverte] = useState<
    string | null
  >(null);
  const [loadingPresenceId, setLoadingPresenceId] = useState<string | null>(
    null
  );
  const [presenceError, setPresenceError] = useState("");

  // =========================
  // RÉCUPÉRATION DES SESSIONS
  // =========================

  async function recupererSessions() {
    const affectations = await getMesFormationsFormateur();

    setFormations(affectations);

    const resultats = await Promise.all(
      affectations.map(async (affectation: FormationAffectee) => {
        const data = await getSessionsFormationFormateur(
          affectation.formation.id
        );

        return data.sessions.map((session) => ({
          ...session,
          formation: data.formation,
        }));
      })
    );

    const toutesLesSessions = resultats.flat();

    toutesLesSessions.sort(
      (a, b) =>
        new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()
    );

    return toutesLesSessions;
  }

  useEffect(() => {
    async function chargerSessions() {
      try {
        const data = await recupererSessions();

        setSessions(data);
      } catch (error) {
        console.error(error);

        setError("Impossible de charger vos sessions.");
      } finally {
        setLoading(false);
      }
    }

    chargerSessions();
  }, []);

  async function rechargerSessions() {
    try {
      const data = await recupererSessions();

      setSessions(data);
    } catch (error) {
      console.error(error);

      setActionError("Impossible de mettre à jour les sessions.");
    }
  }

  // =========================
  // CRÉER UNE SESSION
  // =========================

  async function handleCreerSession(
    formationId: string,
    data: CreateSessionData
  ) {
    try {
      setCreating(true);
      setCreateError("");

      await creerSession(formationId, data);

      setShowCreateForm(false);

      await rechargerSessions();
    } catch (error: unknown) {
      console.error("Erreur création session :", error);
      setCreateError(getErrorMessage(error, "Impossible de créer la session."));
    } finally {
      setCreating(false);
    }
  }

  // =========================
  // DÉMARRER
  // =========================

  async function handleDemarrer(sessionId: string) {
    try {
      setSessionActionId(sessionId);
      setActionError("");

      await demarrerSession(sessionId);

      navigate(`/visio/${sessionId}`);
    } catch (error: unknown) {
      console.error("Erreur démarrage session :", error);
      setActionError(
        getErrorMessage(error, "Impossible de démarrer la session.")
      );
    } finally {
      setSessionActionId(null);
    }
  }

  // =========================
  // REJOINDRE
  // =========================

  async function handleRejoindre(sessionId: string) {
    try {
      setSessionActionId(sessionId);
      setActionError("");

      const data = await rejoindreSession(sessionId);

      const meetingUrl = data.jitsiUrl ?? data.url;

      if (meetingUrl) {
        window.open(meetingUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error: unknown) {
      console.error("Erreur rejoindre session :", error);
      setActionError(
        getErrorMessage(error, "Impossible de rejoindre la session.")
      );
    } finally {
      setSessionActionId(null);
    }
  }

  // =========================
  // TERMINER
  // =========================

  async function handleTerminer(sessionId: string) {
    const confirmation = window.confirm(
      "Voulez-vous vraiment terminer cette session ?"
    );

    if (!confirmation) {
      return;
    }

    try {
      setSessionActionId(sessionId);
      setActionError("");

      await terminerSession(sessionId);

      setPresencesParSession((prev) => {
        const copie = { ...prev };

        delete copie[sessionId];

        return copie;
      });

      await rechargerSessions();
    } catch (error: unknown) {
      console.error("Erreur terminer session :", error);
      setActionError(
        getErrorMessage(error, "Impossible de terminer la session.")
      );
    } finally {
      setSessionActionId(null);
    }
  }

  // =========================
  // VOIR LES PRÉSENCES
  // =========================

  async function handleVoirPresences(sessionId: string) {
    if (sessionPresenceOuverte === sessionId) {
      setSessionPresenceOuverte(null);
      return;
    }

    setSessionPresenceOuverte(sessionId);
    setPresenceError("");

    if (presencesParSession[sessionId]) {
      return;
    }

    try {
      setLoadingPresenceId(sessionId);

      const data = await getPresencesSession(sessionId);

      setPresencesParSession((prev) => ({
        ...prev,
        [sessionId]: data,
      }));
    } catch (error: unknown) {
      console.error("Erreur chargement présences :", error);
      setPresenceError(
        getErrorMessage(error, "Impossible de charger les présences.")
      );
      setSessionPresenceOuverte(null);
    } finally {
      setLoadingPresenceId(null);
    }
  }

  // =========================
  // LOADING GLOBAL
  // =========================

  if (loading) {
    return <div className="p-8 text-slate-500">Chargement des sessions...</div>;
  }

  // =========================
  // SÉPARATION ET FILTRAGE
  // =========================

  const { actives: sessionsActives, terminees: sessionsTerminees } =
    separerSessions(sessions);

  const sessionsHistoriqueFiltrees = filtrerHistorique(
    sessionsTerminees,
    filtresHistorique
  );

  // =========================
  // RENDER
  // =========================

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <header>
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Espace formateur
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">Sessions</h1>

          <p className="mt-2 text-slate-600">
            Consultez et gérez les sessions de vos formations.
          </p>

          <div className="mt-5">
            <button
              type="button"
              onClick={() => {
                setShowCreateForm((prev) => !prev);
                setCreateError("");
              }}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              {showCreateForm ? "Fermer" : "Créer une session"}
            </button>
          </div>
        </header>

        {showCreateForm && (
          <SessionCreateForm
            formations={formations}
            creating={creating}
            createError={createError}
            onSubmit={handleCreerSession}
          />
        )}

        {error && <ErrorAlert message={error} className="mt-6" />}
        {actionError && <ErrorAlert message={actionError} className="mt-4" />}
        {presenceError && (
          <ErrorAlert message={presenceError} className="mt-4" />
        )}

        {!error && sessions.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="font-bold text-slate-900">Aucune session</h2>

            <p className="mt-2 text-sm text-slate-600">
              Aucune session n'est disponible actuellement.
            </p>
          </div>
        )}

        {!error && sessions.length > 0 && (
          <div className="mt-8 space-y-8">
            {/* SESSIONS ACTIVES */}

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                Sessions en cours et à venir
              </h2>

              {sessionsActives.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                  Aucune session active actuellement.
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {sessionsActives.map((session) => (
                    <SessionActiveCard
                      key={session.id}
                      session={session}
                      actionEnCours={sessionActionId === session.id}
                      onDemarrer={handleDemarrer}
                      onRejoindre={handleRejoindre}
                      onTerminer={handleTerminer}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* HISTORIQUE */}

            {sessionsTerminees.length > 0 && (
              <section>
                <button
                  type="button"
                  onClick={() => setShowHistorique((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition hover:bg-slate-50"
                >
                  <div>
                    <h2 className="font-bold text-slate-900">Historique</h2>

                    <p className="text-sm text-slate-500">
                      {sessionsTerminees.length} session
                      {sessionsTerminees.length > 1 ? "s" : ""} terminée
                      {sessionsTerminees.length > 1 ? "s" : ""}
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-cyan-700">
                    {showHistorique ? "Masquer" : "Afficher"}
                  </span>
                </button>

                {showHistorique && (
                  <div className="mt-4">
                    <HistoriqueFilters
                      filtres={filtresHistorique}
                      formations={formations}
                      nombreResultats={sessionsHistoriqueFiltrees.length}
                      onChange={setFiltresHistorique}
                    />

                    <div className="mt-4 space-y-4">
                      {sessionsHistoriqueFiltrees.length === 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                          <h3 className="font-bold text-slate-900">
                            Aucun résultat
                          </h3>

                          <p className="mt-2 text-sm text-slate-500">
                            Aucune session terminée ne correspond aux filtres
                            sélectionnés.
                          </p>
                        </div>
                      )}

                      {sessionsHistoriqueFiltrees.map((session) => (
                        <SessionHistoriqueCard
                          key={session.id}
                          session={session}
                          details={presencesParSession[session.id]}
                          ouvert={sessionPresenceOuverte === session.id}
                          loading={loadingPresenceId === session.id}
                          onTogglePresences={handleVoirPresences}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionsFormateurPage;