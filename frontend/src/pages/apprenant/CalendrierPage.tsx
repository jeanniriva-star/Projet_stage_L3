import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  getMesSessions,
  getMaPresenceSession,
  type SessionApprenant,
  type MaPresenceSessionResponse,
} from "../../services/session.service";

function CalendrierPage() {
  const navigate = useNavigate();

  const [sessions, setSessions] =
    useState<SessionApprenant[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showHistorique, setShowHistorique] =
    useState(false);

const [
  presencesParSession,
  setPresencesParSession,
] = useState<
  Record<
    string,
    MaPresenceSessionResponse | undefined
  >
>({});

  const [
    sessionPresenceOuverte,
    setSessionPresenceOuverte,
  ] = useState<string | null>(null);

  const [
    loadingPresenceId,
    setLoadingPresenceId,
  ] = useState<string | null>(null);

  const [
    presenceError,
    setPresenceError,
  ] = useState("");

  useEffect(() => {
    async function chargerSessions() {
      try {
        const data =
          await getMesSessions();

        setSessions(data);
      } catch (error) {
        console.error(
          "Erreur chargement sessions :",
          error
        );

        setError(
          "Impossible de charger les sessions."
        );
      } finally {
        setLoading(false);
      }
    }

    chargerSessions();
  }, []);

  function handleRejoindre(
    sessionId: string
  ) {
    navigate(
      `/visio/${sessionId}`
    );
  }

  async function handleVoirPresences(
    sessionId: string
  ) {
    if (
      sessionPresenceOuverte ===
      sessionId
    ) {
      setSessionPresenceOuverte(null);
      return;
    }

    setSessionPresenceOuverte(
      sessionId
    );

    setPresenceError("");

    if (
      presencesParSession[
        sessionId
      ]
    ) {
      return;
    }

    try {
      setLoadingPresenceId(
        sessionId
      );
const data =
  await getMaPresenceSession(
    sessionId
  );
      setPresencesParSession(
        (prev) => ({
          ...prev,
          [sessionId]: data,
        })
      );
    } catch (error: unknown) {
      console.error(
        "Erreur chargement présences :",
        error
      );

      if (axios.isAxiosError(error)) {
        setPresenceError(
          error.response?.data?.message ??
            "Impossible de charger les présences."
        );
      } else {
        setPresenceError(
          "Impossible de charger les présences."
        );
      }

      setSessionPresenceOuverte(
        null
      );
    } finally {
      setLoadingPresenceId(null);
    }
  }

  function formatDate(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  }

  function formatHeure(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleTimeString(
      "fr-FR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function statutLabel(
    statut: SessionApprenant["statut"]
  ) {
    switch (statut) {
      case "NON_DEMARREE":
        return "En attente";

      case "EN_COURS":
        return "En cours";

      case "TERMINEE":
        return "Terminée";

      default:
        return statut;
    }
  }

  function statutDot(
    statut: SessionApprenant["statut"]
  ) {
    switch (statut) {
      case "NON_DEMARREE":
        return "bg-amber-500";

      case "EN_COURS":
        return "bg-emerald-500";

      case "TERMINEE":
        return "bg-slate-400";

      default:
        return "bg-slate-400";
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Chargement des sessions...
      </div>
    );
  }

  const sessionsActives =
    sessions.filter(
      (session) =>
        session.statut !==
        "TERMINEE"
    );

  const sessionsTerminees =
    sessions.filter(
      (session) =>
        session.statut ===
        "TERMINEE"
    );

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Espace apprenant
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Calendrier
          </h1>

          <p className="mt-2 text-slate-600">
            Retrouvez les sessions de
            visioconférence de vos
            formations.
          </p>
        </header>

        {presenceError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {presenceError}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!error &&
          sessions.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <h2 className="text-lg font-bold text-slate-900">
                Aucune session disponible
              </h2>

              <p className="mt-2 text-slate-600">
                Aucune session n'est
                programmée pour le moment.
              </p>
            </div>
          )}

        {!error &&
          sessions.length > 0 && (
            <div className="space-y-8">
              {/* SESSIONS ACTIVES */}
              <section>
                <h2 className="text-lg font-bold text-slate-900">
                  Sessions en cours et à venir
                </h2>

                {sessionsActives.length ===
                0 ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                    Aucune session active
                    actuellement.
                  </div>
                ) : (
                  <div className="mt-4 space-y-5">
                    {sessionsActives.map(
                      (session) => (
                        <article
                          key={
                            session.id
                          }
                          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-3">
                                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                                  {
                                    session
                                      .formation
                                      .titre
                                  }
                                </p>

                                <span className="flex items-center gap-2 text-sm text-slate-500">
                                  <span
                                    className={`h-2 w-2 rounded-full ${statutDot(
                                      session.statut
                                    )}`}
                                  />

                                  {statutLabel(
                                    session.statut
                                  )}
                                </span>
                              </div>

                              <h2 className="mt-3 text-xl font-bold text-slate-900">
                                {
                                  session.titre
                                }
                              </h2>

                              {session.description && (
                                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                  {
                                    session.description
                                  }
                                </p>
                              )}

                              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                                <span>
                                  {formatDate(
                                    session.dateDebut
                                  )}
                                </span>

                                <span>
                                  {formatHeure(
                                    session.dateDebut
                                  )}
                                  {" - "}
                                  {formatHeure(
                                    session.dateFin
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0">
                              {session.statut ===
                                "NON_DEMARREE" && (
                                <p className="text-sm font-medium text-slate-500">
                                  En attente du
                                  formateur
                                </p>
                              )}

                              {session.statut ===
                                "EN_COURS" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRejoindre(
                                      session.id
                                    )
                                  }
                                  className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
                                >
                                  Rejoindre la
                                  visioconférence
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      )
                    )}
                  </div>
                )}
              </section>

              {/* HISTORIQUE */}
              {sessionsTerminees.length >
                0 && (
                <section>
                  <button
                    type="button"
                    onClick={() =>
                      setShowHistorique(
                        (prev) =>
                          !prev
                      )
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition hover:bg-slate-50"
                  >
                    <div>
                      <h2 className="font-bold text-slate-900">
                        Historique
                      </h2>

                      <p className="text-sm text-slate-500">
                        {
                          sessionsTerminees.length
                        }{" "}
                        session
                        {sessionsTerminees.length >
                        1
                          ? "s"
                          : ""}{" "}
                        terminée
                        {sessionsTerminees.length >
                        1
                          ? "s"
                          : ""}
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-cyan-700">
                      {showHistorique
                        ? "Masquer"
                        : "Afficher"}
                    </span>
                  </button>

                  {showHistorique && (
                    <div className="mt-4 space-y-4">
                      {sessionsTerminees.map(
                        (
                          session
                        ) => {
                          const details =
                            presencesParSession[
                              session.id
                            ];
                          const ouvert =
                            sessionPresenceOuverte ===
                            session.id;

                          return (
                            <article
                              key={
                                session.id
                              }
                              className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                            >
                              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                {
                                  session
                                    .formation
                                    .titre
                                }
                              </p>

                              <h3 className="mt-1 font-bold text-slate-800">
                                {
                                  session.titre
                                }
                              </h3>

                              {session.description && (
                                <p className="mt-2 text-sm text-slate-600">
                                  {
                                    session.description
                                  }
                                </p>
                              )}

                              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                                <span>
                                  {formatDate(
                                    session.dateDebut
                                  )}
                                </span>

                                <span>
                                  {formatHeure(
                                    session.dateDebut
                                  )}
                                  {" - "}
                                  {formatHeure(
                                    session.dateFin
                                  )}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleVoirPresences(
                                    session.id
                                  )
                                }
                                disabled={
                                  loadingPresenceId ===
                                  session.id
                                }
                                className="mt-4 text-sm font-semibold text-cyan-700 transition hover:text-cyan-900 disabled:opacity-50"
                              >{loadingPresenceId ===
                              session.id
                                ? "Chargement..."
                                : ouvert
                                ? "Masquer mon statut"
                                : "Voir ma présence"}
                                
                              </button>
{ouvert &&
  details && (
    <div className="mt-5 border-t border-slate-200 pt-5">
      <div className="rounded-xl bg-white p-4">
        <p className="text-sm text-slate-500">
          Votre présence
        </p>

        <div className="mt-2 flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              details.maPresence.present
                ? "bg-emerald-500"
                : "bg-red-500"
            }`}
          />

          <span
            className={`font-semibold ${
              details.maPresence.present
                ? "text-emerald-700"
                : "text-red-700"
            }`}
          >
            {details.maPresence.present
              ? "Présent"
              : "Absent"}
          </span>
        </div>

        {details.maPresence.dateMarquage && (
          <p className="mt-2 text-xs text-slate-500">
            Enregistré le{" "}
            {formatDate(
              details.maPresence.dateMarquage
            )}{" "}
            à{" "}
            {formatHeure(
              details.maPresence.dateMarquage
            )}
          </p>
        )}
      </div>
    </div>

                                )}
                            </article>
                          );
                        }
                      )}

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

export default CalendrierPage;