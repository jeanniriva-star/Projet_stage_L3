import { useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import axios from "axios";

import { useAuth } from "../hooks/useAuth";
import { rejoindreSession } from "../services/session.service";

type JitsiApi = {
  dispose: () => void;

  addListener?: (
    event: string,
    callback: (...args: unknown[]) => void
  ) => void;
};

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (
      domain: string,
      options: {
        roomName: string;
        parentNode: HTMLElement;
        width?: string | number;
        height?: string | number;
        jwt?: string;

        userInfo?: {
          displayName?: string;
          email?: string;
        };

        configOverwrite?: Record<
          string,
          unknown
        >;

        interfaceConfigOverwrite?: Record<
          string,
          unknown
        >;
      }
    ) => JitsiApi;
  }
}

function chargerScriptJitsi(
  domain: string
): Promise<void> {
  return new Promise(
    (resolve, reject) => {
      if (
        window.JitsiMeetExternalAPI
      ) {
        resolve();
        return;
      }

      const scriptExistant =
        document.querySelector(
          `script[data-jitsi-api="${domain}"]`
        );

      if (scriptExistant) {
        scriptExistant.addEventListener(
          "load",
          () => resolve()
        );

        scriptExistant.addEventListener(
          "error",
          () =>
            reject(
              new Error(
                "Impossible de charger Jitsi."
              )
            )
        );

        return;
      }

      const script =
        document.createElement(
          "script"
        );

      script.src =
        `https://${domain}/external_api.js`;

      script.async = true;

      script.dataset.jitsiApi =
        domain;

      script.onload = () =>
        resolve();

      script.onerror = () =>
        reject(
          new Error(
            "Impossible de charger Jitsi."
          )
        );

      document.body.appendChild(
        script
      );
    }
  );
}

function VisioPage() {
  const { sessionId } =
    useParams();

  const navigate =
    useNavigate();

  const { user } =
    useAuth();

  const jitsiContainerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const apiRef =
    useRef<JitsiApi | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (
      !sessionId ||
      !user
    ) {
      return;
    }

    const currentSessionId =
      sessionId;

    const currentUser =
      user;

    let annule = false;

    async function initialiserVisio() {
      try {
        const data =
          await rejoindreSession(
            currentSessionId
          );

        if (annule) {
          return;
        }

        const jwt =
          data.jwt;

        const domain =
          data.domain;

        const roomName =
          data.roomName;

        if (
          !jwt ||
          !domain ||
          !roomName
        ) {
          throw new Error(
            "Configuration JaaS incomplète."
          );
        }

        await chargerScriptJitsi(
          domain
        );

        if (
          annule ||
          !jitsiContainerRef.current
        ) {
          return;
        }

        if (
          !window.JitsiMeetExternalAPI
        ) {
          throw new Error(
            "L'API Jitsi n'a pas pu être chargée."
          );
        }

        const displayName =
          `${currentUser.prenom ?? ""} ${currentUser.nom ?? ""}`.trim() ||
          currentUser.email;

        const jitsiApi =
          new window.JitsiMeetExternalAPI(
            domain,
            {
              roomName,

              jwt,

              parentNode:
                jitsiContainerRef.current,

              width: "100%",
              height: "100%",

              userInfo: {
                displayName,
                email:
                  currentUser.email,
              },

              configOverwrite: {
                prejoinConfig: {
                  enabled: false,
                },

                startWithAudioMuted:
                  true,

                startWithVideoMuted:
                  true,

                toolbarButtons:
                  currentUser.role ===
                  "FORMATEUR"
                    ? [
                        "microphone",
                        "camera",
                        "desktop",
                        "chat",
                        "participants-pane",
                        "raisehand",
                        "tileview",
                        "fullscreen",
                        "settings",
                        "security",
                        "mute-everyone",
                        "mute-video-everyone",
                        "hangup",
                      ]
                    : [
                        "microphone",
                        "camera",
                        "chat",
                        "participants-pane",
                        "hangup",
                      ],

                participantsPane: {
                  hideModeratorSettingsTab:
                    currentUser.role !==
                    "FORMATEUR",

                  hideMoreActionsButton:
                    currentUser.role !==
                    "FORMATEUR",

                  hideMuteAllButton:
                    currentUser.role !==
                    "FORMATEUR",
                },
              },
            }
          );

        apiRef.current =
          jitsiApi;

        jitsiApi.addListener?.(
          "participantRoleChanged",
          (
            ...args: unknown[]
          ) => {
            const event =
              args[0] as
                | {
                    role?: string;
                  }
                | undefined;

            if (
              !event?.role
            ) {
              return;
            }

            console.log(
              "Rôle Jitsi :",
              event.role
            );

            if (
              currentUser.role ===
                "FORMATEUR" &&
              event.role ===
                "moderator"
            ) {
              console.log(
                "Formateur reconnu comme modérateur Jitsi."
              );
            }

            if (
              currentUser.role ===
                "APPRENANT" &&
              event.role ===
                "moderator"
            ) {
              console.warn(
                "Attention : l'apprenant a reçu le rôle modérateur Jitsi."
              );
            }
          }
        );

        setLoading(false);
      } catch (
        error: unknown
      ) {
        console.error(
          "Erreur visioconférence :",
          error
        );

        if (
          axios.isAxiosError(
            error
          )
        ) {
          setError(
            error.response?.data
              ?.message ??
              "Impossible d'accéder à la visioconférence."
          );
        } else if (
          error instanceof Error
        ) {
          setError(
            error.message
          );
        } else {
          setError(
            "Impossible d'accéder à la visioconférence."
          );
        }

        setLoading(false);
      }
    }

    initialiserVisio();

    return () => {
      annule = true;

      if (
        apiRef.current
      ) {
        apiRef.current.dispose();
        apiRef.current =
          null;
      }
    };
  }, [sessionId, user]);

  function quitterVisio() {
    if (
      apiRef.current
    ) {
      apiRef.current.dispose();
      apiRef.current =
        null;
    }

    if (!user) {
      navigate("/");
      return;
    }

    if (
      user.role ===
      "FORMATEUR"
    ) {
      navigate(
        "/formateur/sessions"
      );
    } else {
      navigate(
        "/apprenant/calendrier"
      );
    }
  }

  if (
    !sessionId ||
    !user
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900">
            Accès impossible
          </h1>

          <p className="mt-3 text-sm text-red-700">
            Impossible d'accéder à la visioconférence.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* HEADER FIXE */}
      <header className="fixed left-0 right-0 top-0 z-[100] flex h-[69px] items-center justify-between border-b border-slate-800 bg-slate-950 px-5 shadow-lg">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
            Spray_info
          </p>

          <h1 className="text-lg font-bold text-white">
            Visioconférence
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-white">
              {user.prenom}{" "}
              {user.nom}
            </p>

            <p className="text-xs text-slate-400">
              {user.role ===
              "FORMATEUR"
                ? "Formateur"
                : "Apprenant"}
            </p>
          </div>

          <button
            type="button"
            onClick={
              quitterVisio
            }
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Quitter
          </button>
        </div>
      </header>

      {/* CONTENU SOUS LE HEADER */}
      <main className="pt-[69px]">
        {error ? (
          <div className="flex min-h-[calc(100vh-69px)] items-center justify-center p-6">
            <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center">
              <h2 className="text-xl font-bold text-slate-900">
                Accès impossible
              </h2>

              <p className="mt-3 text-sm text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={
                  quitterVisio
                }
                className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Retour
              </button>
            </div>
          </div>
        ) : (
          <div className="relative h-[calc(100vh-69px)] overflow-hidden">
            {loading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950">
                <div className="text-center">
                  <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

                  <p className="mt-4 text-sm text-slate-300">
                    Connexion à la visioconférence...
                  </p>
                </div>
              </div>
            )}

            <div
              ref={
                jitsiContainerRef
              }
              className="h-full w-full"
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default VisioPage;