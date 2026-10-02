import { useEffect, useState } from "react";
import axios from "axios";
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
  type SessionFormateur,
  type PresencesSessionResponse,
} from "../../services/session.service";

interface SessionAvecFormation
  extends SessionFormateur {
  formation: {
    id: string;
    titre: string;
  };
}

function SessionsFormateurPage() {
  const navigate = useNavigate();

  const [sessions, setSessions] =
    useState<SessionAvecFormation[]>([]);

  const [formations, setFormations] =
    useState<FormationAffectee[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    showHistorique,
    setShowHistorique,
  ] = useState(false);

  const [
    sessionActionId,
    setSessionActionId,
  ] = useState<string | null>(
    null
  );

  const [
    actionError,
    setActionError,
  ] = useState("");

  // =========================
  // FILTRES HISTORIQUE
  // =========================

  const [
    rechercheHistorique,
    setRechercheHistorique,
  ] = useState("");

  const [
    formationHistorique,
    setFormationHistorique,
  ] = useState("");

  const [
    dateHistorique,
    setDateHistorique,
  ] = useState("");

  // =========================
  // CRÉATION DE SESSION
  // =========================

  const [
    showCreateForm,
    setShowCreateForm,
  ] = useState(false);

  const [
    formationId,
    setFormationId,
  ] = useState("");

  const [titre, setTitre] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    dateDebut,
    setDateDebut,
  ] = useState("");

  const [
    dateFin,
    setDateFin,
  ] = useState("");

  const [
    creating,
    setCreating,
  ] = useState(false);

  const [
    createError,
    setCreateError,
  ] = useState("");

  // =========================
  // PRÉSENCES
  // =========================

  const [
    presencesParSession,
    setPresencesParSession,
  ] = useState<
    Record<
      string,
      | PresencesSessionResponse
      | undefined
    >
  >({});

  const [
    sessionPresenceOuverte,
    setSessionPresenceOuverte,
  ] = useState<string | null>(
    null
  );

  const [
    loadingPresenceId,
    setLoadingPresenceId,
  ] = useState<string | null>(
    null
  );

  const [
    presenceError,
    setPresenceError,
  ] = useState("");

  // =========================
  // RÉCUPÉRATION DES SESSIONS
  // =========================

  async function recupererSessions() {
    const affectations =
      await getMesFormationsFormateur();

    setFormations(affectations);

    const resultats =
      await Promise.all(
        affectations.map(
          async (
            affectation: FormationAffectee
          ) => {
            const data =
              await getSessionsFormationFormateur(
                affectation
                  .formation.id
              );

            return data.sessions.map(
              (session) => ({
                ...session,
                formation:
                  data.formation,
              })
            );
          }
        )
      );

    const toutesLesSessions =
      resultats.flat();

    toutesLesSessions.sort(
      (a, b) =>
        new Date(
          a.dateDebut
        ).getTime() -
        new Date(
          b.dateDebut
        ).getTime()
    );

    return toutesLesSessions;
  }

  useEffect(() => {
    async function chargerSessions() {
      try {
        const data =
          await recupererSessions();

        setSessions(data);
      } catch (error) {
        console.error(
          error
        );

        setError(
          "Impossible de charger vos sessions."
        );
      } finally {
        setLoading(false);
      }
    }

    chargerSessions();
  }, []);

  async function rechargerSessions() {
    try {
      const data =
        await recupererSessions();

      setSessions(data);
    } catch (error) {
      console.error(
        error
      );

      setActionError(
        "Impossible de mettre à jour les sessions."
      );
    }
  }

  // =========================
  // FORMATAGE DATE
  // =========================

  function formaterDate(
    date: string
  ) {
    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(
      new Date(date)
    );
  }

  // =========================
  // CRÉER UNE SESSION
  // =========================

  async function handleCreerSession(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setCreateError("");

    if (
      !formationId ||
      !titre.trim() ||
      !dateDebut ||
      !dateFin
    ) {
      setCreateError(
        "Veuillez remplir tous les champs obligatoires."
      );

      return;
    }

    if (
      new Date(dateFin) <=
      new Date(dateDebut)
    ) {
      setCreateError(
        "La date de fin doit être après la date de début."
      );

      return;
    }

    try {
      setCreating(true);

      await creerSession(
        formationId,
        {
          titre:
            titre.trim(),

          description:
            description.trim() ||
            undefined,

          dateDebut:
            new Date(
              dateDebut
            ).toISOString(),

          dateFin:
            new Date(
              dateFin
            ).toISOString(),
        }
      );

      setFormationId("");
      setTitre("");
      setDescription("");
      setDateDebut("");
      setDateFin("");

      setShowCreateForm(
        false
      );

      await rechargerSessions();
    } catch (
      error: unknown
    ) {
      console.error(
        "Erreur création session :",
        error
      );

      if (
        axios.isAxiosError(
          error
        )
      ) {
        setCreateError(
          error.response?.data
            ?.message ??
            "Impossible de créer la session."
        );
      } else {
        setCreateError(
          "Impossible de créer la session."
        );
      }
    } finally {
      setCreating(false);
    }
  }

  // =========================
  // DÉMARRER
  // =========================

  async function handleDemarrer(
    sessionId: string
  ) {
    try {
      setSessionActionId(
        sessionId
      );

      setActionError("");

      await demarrerSession(
        sessionId
      );

      navigate(
        `/visio/${sessionId}`
      );
    } catch (
      error: unknown
    ) {
      console.error(
        "Erreur démarrage session :",
        error
      );

      if (
        axios.isAxiosError(
          error
        )
      ) {
        setActionError(
          error.response?.data
            ?.message ??
            "Impossible de démarrer la session."
        );
      } else {
        setActionError(
          "Impossible de démarrer la session."
        );
      }
    } finally {
      setSessionActionId(
        null
      );
    }
  }

  // =========================
  // REJOINDRE
  // =========================

  async function handleRejoindre(
    sessionId: string
  ) {
    try {
      setSessionActionId(
        sessionId
      );

      setActionError("");

      const data =
        await rejoindreSession(
          sessionId
        );

      const meetingUrl =
        data.jitsiUrl ??
        data.url;

      if (meetingUrl) {
        window.open(
          meetingUrl,
          "_blank",
          "noopener,noreferrer"
        );
      }
    } catch (
      error: unknown
    ) {
      console.error(
        "Erreur rejoindre session :",
        error
      );

      if (
        axios.isAxiosError(
          error
        )
      ) {
        setActionError(
          error.response?.data
            ?.message ??
            "Impossible de rejoindre la session."
        );
      } else {
        setActionError(
          "Impossible de rejoindre la session."
        );
      }
    } finally {
      setSessionActionId(
        null
      );
    }
  }

  // =========================
  // TERMINER
  // =========================

  async function handleTerminer(
    sessionId: string
  ) {
    const confirmation =
      window.confirm(
        "Voulez-vous vraiment terminer cette session ?"
      );

    if (!confirmation) {
      return;
    }

    try {
      setSessionActionId(
        sessionId
      );

      setActionError("");

      await terminerSession(
        sessionId
      );

      setPresencesParSession(
        (prev) => {
          const copie = {
            ...prev,
          };

          delete copie[
            sessionId
          ];

          return copie;
        }
      );

      await rechargerSessions();
    } catch (
      error: unknown
    ) {
      console.error(
        "Erreur terminer session :",
        error
      );

      if (
        axios.isAxiosError(
          error
        )
      ) {
        setActionError(
          error.response?.data
            ?.message ??
            "Impossible de terminer la session."
        );
      } else {
        setActionError(
          "Impossible de terminer la session."
        );
      }
    } finally {
      setSessionActionId(
        null
      );
    }
  }

  // =========================
  // VOIR LES PRÉSENCES
  // =========================

  async function handleVoirPresences(
    sessionId: string
  ) {
    if (
      sessionPresenceOuverte ===
      sessionId
    ) {
      setSessionPresenceOuverte(
        null
      );

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
        await getPresencesSession(
          sessionId
        );

      setPresencesParSession(
        (prev) => ({
          ...prev,
          [sessionId]:
            data,
        })
      );
    } catch (
      error: unknown
    ) {
      console.error(
        "Erreur chargement présences :",
        error
      );

      if (
        axios.isAxiosError(
          error
        )
      ) {
        setPresenceError(
          error.response?.data
            ?.message ??
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
      setLoadingPresenceId(
        null
      );
    }
  }

  // =========================
  // LOADING GLOBAL
  // =========================

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Chargement des
        sessions...
      </div>
    );
  }

  // =========================
  // SÉPARATION ACTIVES / HISTORIQUE
  // =========================

  const sessionsActives =
    sessions.filter(
      (session) =>
        session.statut !==
        "TERMINEE"
    );

  const sessionsTerminees =
    sessions
      .filter(
        (session) =>
          session.statut ===
          "TERMINEE"
      )
      .sort(
        (a, b) =>
          new Date(
            b.dateDebut
          ).getTime() -
          new Date(
            a.dateDebut
          ).getTime()
      );

  // =========================
  // FILTRAGE HISTORIQUE
  // =========================

  const sessionsHistoriqueFiltrees =
    sessionsTerminees.filter(
      (session) => {
        const recherche =
          rechercheHistorique
            .trim()
            .toLowerCase();

        const correspondRecherche =
          !recherche ||
          session.titre
            .toLowerCase()
            .includes(
              recherche
            ) ||
          session.formation.titre
            .toLowerCase()
            .includes(
              recherche
            );

        const correspondFormation =
          !formationHistorique ||
          session.formation.id ===
            formationHistorique;

        /*
         * Comparaison en date locale.
         * On évite toISOString()
         * pour ne pas décaler le jour
         * selon le fuseau horaire.
         */
        const dateSession =
          new Date(
            session.dateDebut
          );

        const annee =
          dateSession.getFullYear();

        const mois = String(
          dateSession.getMonth() +
            1
        ).padStart(2, "0");

        const jour = String(
          dateSession.getDate()
        ).padStart(2, "0");

        const dateLocale =
          `${annee}-${mois}-${jour}`;

        const correspondDate =
          !dateHistorique ||
          dateLocale ===
            dateHistorique;

        return (
          correspondRecherche &&
          correspondFormation &&
          correspondDate
        );
      }
    );

  // =========================
  // RENDER
  // =========================

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* =========================
            HEADER
        ========================= */}

        <header>
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Espace formateur
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Sessions
          </h1>

          <p className="mt-2 text-slate-600">
            Consultez et gérez
            les sessions de vos
            formations.
          </p>

          <div className="mt-5">
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(
                  (prev) =>
                    !prev
                );

                setCreateError(
                  ""
                );
              }}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              {showCreateForm
                ? "Fermer"
                : "Créer une session"}
            </button>
          </div>
        </header>

        {/* =========================
            FORMULAIRE CRÉATION
        ========================= */}

        {showCreateForm && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Nouvelle session
            </h2>

            <form
              onSubmit={
                handleCreerSession
              }
              className="mt-5 space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Formation
                </label>

                <select
                  value={
                    formationId
                  }
                  onChange={(
                    event
                  ) =>
                    setFormationId(
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
                >
                  <option value="">
                    Sélectionner une
                    formation
                  </option>

                  {formations.map(
                    (
                      affectation
                    ) => (
                      <option
                        key={
                          affectation
                            .formation
                            .id
                        }
                        value={
                          affectation
                            .formation
                            .id
                        }
                      >
                        {
                          affectation
                            .formation
                            .titre
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Titre
                </label>

                <input
                  type="text"
                  value={titre}
                  onChange={(
                    event
                  ) =>
                    setTitre(
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
                  placeholder="Ex. Session React - Hooks"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  value={
                    description
                  }
                  onChange={(
                    event
                  ) =>
                    setDescription(
                      event.target
                        .value
                    )
                  }
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
                  placeholder="Description de la session"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Début
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      dateDebut
                    }
                    onChange={(
                      event
                    ) =>
                      setDateDebut(
                        event.target
                          .value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Fin
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      dateFin
                    }
                    onChange={(
                      event
                    ) =>
                      setDateFin(
                        event.target
                          .value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              {createError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {createError}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  creating
                }
                className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating
                  ? "Création..."
                  : "Créer la session"}
              </button>
            </form>
          </section>
        )}

        {/* =========================
            ERREURS
        ========================= */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {actionError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </div>
        )}

        {presenceError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {presenceError}
          </div>
        )}

        {/* =========================
            AUCUNE SESSION
        ========================= */}

        {!error &&
          sessions.length ===
            0 && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <h2 className="font-bold text-slate-900">
                Aucune session
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Aucune session
                n'est disponible
                actuellement.
              </p>
            </div>
          )}

        {!error &&
          sessions.length >
            0 && (
            <div className="mt-8 space-y-8">
              {/* =========================
                  SESSIONS ACTIVES
              ========================= */}

              <section>
                <h2 className="text-lg font-bold text-slate-900">
                  Sessions en
                  cours et à venir
                </h2>

                {sessionsActives.length ===
                0 ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                    Aucune session
                    active
                    actuellement.
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    {sessionsActives.map(
                      (
                        session
                      ) => (
                        <article
                          key={
                            session.id
                          }
                          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                          <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                                  {
                                    session
                                      .formation
                                      .titre
                                  }
                                </p>

                                <h3 className="mt-2 text-xl font-bold text-slate-900">
                                  {
                                    session.titre
                                  }
                                </h3>

                                {session.description && (
                                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                    {
                                      session.description
                                    }
                                  </p>
                                )}

                                <div className="mt-4 space-y-1 text-sm text-slate-500">
                                  <p>
                                    Début :{" "}
                                    {formaterDate(
                                      session.dateDebut
                                    )}
                                  </p>

                                  <p>
                                    Fin :{" "}
                                    {formaterDate(
                                      session.dateFin
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-2.5 w-2.5 rounded-full ${
                                    session.statut ===
                                    "EN_COURS"
                                      ? "bg-emerald-500"
                                      : "bg-amber-500"
                                  }`}
                                />

                                <span className="text-sm font-medium text-slate-700">
                                  {session.statut ===
                                  "EN_COURS"
                                    ? "En cours"
                                    : "Non démarrée"}
                                </span>
                              </div>
                            </div>

                            {/* ACTIONS */}

                            <div className="flex flex-wrap gap-3">
                              {session.statut ===
                                "NON_DEMARREE" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDemarrer(
                                      session.id
                                    )
                                  }
                                  disabled={
                                    sessionActionId ===
                                    session.id
                                  }
                                  className="rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {sessionActionId ===
                                  session.id
                                    ? "Démarrage..."
                                    : "Démarrer la visioconférence"}
                                </button>
                              )}

                              {session.statut ===
                                "EN_COURS" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRejoindre(
                                        session.id
                                      )
                                    }
                                    disabled={
                                      sessionActionId ===
                                      session.id
                                    }
                                    className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {sessionActionId ===
                                    session.id
                                      ? "Ouverture..."
                                      : "Rejoindre"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleTerminer(
                                        session.id
                                      )
                                    }
                                    disabled={
                                      sessionActionId ===
                                      session.id
                                    }
                                    className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    Terminer
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </article>
                      )
                    )}
                  </div>
                )}
              </section>

              {/* =========================
                  HISTORIQUE
              ========================= */}

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
                    <div className="mt-4">
                      {/* =========================
                          FILTRES HISTORIQUE
                      ========================= */}

                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="grid gap-4 lg:grid-cols-3">
                          {/* RECHERCHE */}

                          <div>
                            <label
                              htmlFor="historique-recherche"
                              className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                              Rechercher
                            </label>

                            <input
                              id="historique-recherche"
                              type="search"
                              value={
                                rechercheHistorique
                              }
                              onChange={(
                                event
                              ) =>
                                setRechercheHistorique(
                                  event
                                    .target
                                    .value
                                )
                              }
                              placeholder="Titre de session..."
                              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-600"
                            />
                          </div>

                          {/* FORMATION */}

                          <div>
                            <label
                              htmlFor="historique-formation"
                              className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                              Formation
                            </label>

                            <select
                              id="historique-formation"
                              value={
                                formationHistorique
                              }
                              onChange={(
                                event
                              ) =>
                                setFormationHistorique(
                                  event
                                    .target
                                    .value
                                )
                              }
                              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-600"
                            >
                              <option value="">
                                Toutes les
                                formations
                              </option>

                              {formations.map(
                                (
                                  affectation
                                ) => (
                                  <option
                                    key={
                                      affectation
                                        .formation
                                        .id
                                    }
                                    value={
                                      affectation
                                        .formation
                                        .id
                                    }
                                  >
                                    {
                                      affectation
                                        .formation
                                        .titre
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          {/* DATE */}

                          <div>
                            <label
                              htmlFor="historique-date"
                              className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                              Date
                            </label>

                            <input
                              id="historique-date"
                              type="date"
                              value={
                                dateHistorique
                              }
                              onChange={(
                                event
                              ) =>
                                setDateHistorique(
                                  event
                                    .target
                                    .value
                                )
                              }
                              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-600"
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm text-slate-500">
                            {
                              sessionsHistoriqueFiltrees.length
                            }{" "}
                            résultat
                            {sessionsHistoriqueFiltrees.length >
                            1
                              ? "s"
                              : ""}
                          </p>

                          {(rechercheHistorique ||
                            formationHistorique ||
                            dateHistorique) && (
                            <button
                              type="button"
                              onClick={() => {
                                setRechercheHistorique(
                                  ""
                                );

                                setFormationHistorique(
                                  ""
                                );

                                setDateHistorique(
                                  ""
                                );
                              }}
                              className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
                            >
                              Réinitialiser
                              les filtres
                            </button>
                          )}
                        </div>
                      </div>

                      {/* =========================
                          LISTE HISTORIQUE
                      ========================= */}

                      <div className="mt-4 space-y-4">
                        {sessionsHistoriqueFiltrees.length ===
                          0 && (
                          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                            <h3 className="font-bold text-slate-900">
                              Aucun
                              résultat
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                              Aucune
                              session
                              terminée ne
                              correspond
                              aux filtres
                              sélectionnés.
                            </p>
                          </div>
                        )}

                        {sessionsHistoriqueFiltrees.map(
                          (
                            session
                          ) => {
                            const details =
                              presencesParSession[
                                session
                                  .id
                              ];

                            const presents =
                              details?.presences.filter(
                                (
                                  presence
                                ) =>
                                  presence.present
                              ) ??
                              [];

                            const absents =
                              details?.presences.filter(
                                (
                                  presence
                                ) =>
                                  !presence.present
                              ) ??
                              [];

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
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                  <div>
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

                                    <div className="mt-3 space-y-1 text-sm text-slate-500">
                                      <p>
                                        {formaterDate(
                                          session.dateDebut
                                        )}
                                      </p>

                                      <p>
                                        Présences
                                        enregistrées :{" "}
                                        {
                                          session
                                            ._count
                                            .presences
                                        }
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />

                                    <span className="text-sm font-medium text-slate-500">
                                      Terminée
                                    </span>
                                  </div>
                                </div>

                                {/* VOIR PRÉSENCES */}

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
                                >
                                  {loadingPresenceId ===
                                  session.id
                                    ? "Chargement..."
                                    : ouvert
                                    ? "Masquer les présences"
                                    : "Voir les présences"}
                                </button>

                                {/* DÉTAILS PRÉSENCE */}

                                {ouvert &&
                                  details && (
                                    <div className="mt-5 border-t border-slate-200 pt-5">
                                      <div className="flex flex-wrap gap-5 text-sm">
                                        <span className="font-semibold text-emerald-700">
                                          Présents :{" "}
                                          {
                                            details
                                              .statistiques
                                              .presents
                                          }
                                        </span>

                                        <span className="font-semibold text-red-700">
                                          Absents :{" "}
                                          {
                                            details
                                              .statistiques
                                              .absents
                                          }
                                        </span>

                                        <span className="font-semibold text-slate-600">
                                          Total :{" "}
                                          {
                                            details
                                              .statistiques
                                              .total
                                          }
                                        </span>
                                      </div>

                                      <div className="mt-5 grid gap-5 md:grid-cols-2">
                                        {/* PRÉSENTS */}

                                        <div>
                                          <h4 className="font-bold text-slate-900">
                                            Présents
                                          </h4>

                                          {presents.length ===
                                          0 ? (
                                            <p className="mt-2 text-sm text-slate-500">
                                              Aucun
                                              apprenant
                                              présent.
                                            </p>
                                          ) : (
                                            <div className="mt-3 space-y-2">
                                              {presents.map(
                                                (
                                                  presence
                                                ) => (
                                                  <div
                                                    key={
                                                      presence.id
                                                    }
                                                    className="rounded-lg border border-slate-200 bg-white px-4 py-3"
                                                  >
                                                    <p className="text-sm font-semibold text-slate-800">
                                                      {
                                                        presence
                                                          .inscription
                                                          .apprenant
                                                          .prenom
                                                      }{" "}
                                                      {
                                                        presence
                                                          .inscription
                                                          .apprenant
                                                          .nom
                                                      }
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                      {
                                                        presence
                                                          .inscription
                                                          .apprenant
                                                          .email
                                                      }
                                                    </p>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          )}
                                        </div>

                                        {/* ABSENTS */}

                                        <div>
                                          <h4 className="font-bold text-slate-900">
                                            Absents
                                          </h4>

                                          {absents.length ===
                                          0 ? (
                                            <p className="mt-2 text-sm text-slate-500">
                                              Aucun
                                              apprenant
                                              absent.
                                            </p>
                                          ) : (
                                            <div className="mt-3 space-y-2">
                                              {absents.map(
                                                (
                                                  presence
                                                ) => (
                                                  <div
                                                    key={
                                                      presence.id
                                                    }
                                                    className="rounded-lg border border-slate-200 bg-white px-4 py-3"
                                                  >
                                                    <p className="text-sm font-semibold text-slate-800">
                                                      {
                                                        presence
                                                          .inscription
                                                          .apprenant
                                                          .prenom
                                                      }{" "}
                                                      {
                                                        presence
                                                          .inscription
                                                          .apprenant
                                                          .nom
                                                      }
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                      {
                                                        presence
                                                          .inscription
                                                          .apprenant
                                                          .email
                                                      }
                                                    </p>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                              </article>
                            );
                          }
                        )}
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