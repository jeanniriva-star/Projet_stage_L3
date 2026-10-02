import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  downloadRessource,
  getRessourcesCours,
  type RessourceCours,
} from "../../services/ressource.service";
import ExercicesSection from "../../components/ExercicesSection";

import {
  getMesEvaluations,
  type EvaluationApprenant,
} from "../../services/evaluation.service";

function CoursPage() {
  const { coursId } = useParams();

  const [titreCours, setTitreCours] = useState("");
  const [titreFormation, setTitreFormation] = useState("");

  const [ressources, setRessources] = useState<RessourceCours[]>([]);

  const [evaluations, setEvaluations] = useState<
    EvaluationApprenant[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] =
  useState<string | null>(null);
  useEffect(() => {
    async function chargerCours() {
      if (!coursId) {
        setLoading(false);
        return;
      }

      try {
        const [dataRessources, dataEvaluations] =
          await Promise.all([
            getRessourcesCours(coursId),
            getMesEvaluations(),
          ]);

        setTitreCours(dataRessources.cours.titre);

        setTitreFormation(
          dataRessources.cours.formation.titre
        );

        setRessources(dataRessources.ressources);

        const evaluationsDuCours =
          dataEvaluations.filter(
            (evaluation) =>
              evaluation.cours.id === coursId
          );

        setEvaluations(evaluationsDuCours);
      } catch (err) {
        console.error(err);

        setError(
          "Impossible de charger ce cours."
        );
      } finally {
        setLoading(false);
      }
    }

    chargerCours();
  }, [coursId]);

 function estFichier(
  ressource: RessourceCours
) {
  return ressource.url.startsWith(
    "/uploads/ressources/"
  );
}

async function handleTelecharger(
  ressource: RessourceCours
) {
  try {
    setDownloadingId(
      ressource.id
    );

    await downloadRessource(
      ressource.id,
      ressource.nom
    );
  } catch (err) {
    console.error(
      "Erreur téléchargement :",
      err
    );

    if (
      axios.isAxiosError(err)
    ) {
      window.alert(
        err.response?.data?.message ??
          "Impossible de télécharger ce document."
      );
    } else {
      window.alert(
        "Impossible de télécharger ce document."
      );
    }
  } finally {
    setDownloadingId(
      null
    );
  }
}
const documents = ressources.filter(
  (ressource) =>
    estFichier(ressource) ||
    [
      "PDF",
      "DOCUMENT",
      "WORD",
      "POWERPOINT",
    ].includes(
      ressource.type.toUpperCase()
    )
);

  const videos = ressources.filter(
    (ressource) =>
      ressource.type.toUpperCase() === "VIDEO"
  );

  const liens = ressources.filter(
    (ressource) =>
      ressource.type.toUpperCase() === "LIEN"
  );

  const autres = ressources.filter(
  (ressource) =>
    !estFichier(ressource) &&
    ![
      "PDF",
      "DOCUMENT",
      "WORD",
      "POWERPOINT",
      "VIDEO",
      "LIEN",
    ].includes(
      ressource.type.toUpperCase()
    )
);
  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Chargement du cours...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-200 bg-white p-8">
          <h1 className="text-xl font-bold text-slate-900">
            Impossible d'ouvrir le cours
          </h1>

          <p className="mt-3 text-red-600">
            {error}
          </p>

          <Link
            to="/apprenant/mes-formations"
            className="mt-6 inline-flex text-sm font-semibold text-cyan-700 hover:text-cyan-900"
          >
            ← Retour à mes formations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/apprenant/mes-formations"
          className="text-sm font-semibold text-cyan-700 hover:text-cyan-900"
        >
          ← Retour à mes formations
        </Link>

        <header className="mt-6 border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            {titreFormation}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {titreCours}
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600">
            Retrouvez ici les supports pédagogiques et
            les évaluations associés à ce cours.
          </p>

          <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-500">
            <span>
              {ressources.length} ressource
              {ressources.length > 1 ? "s" : ""}
            </span>

            {documents.length > 0 && (
              <span>
                {documents.length} document
                {documents.length > 1 ? "s" : ""}
              </span>
            )}

            {videos.length > 0 && (
              <span>
                {videos.length} vidéo
                {videos.length > 1 ? "s" : ""}
              </span>
            )}

            {liens.length > 0 && (
              <span>
                {liens.length} lien
                {liens.length > 1 ? "s" : ""}
              </span>
            )}

            {evaluations.length > 0 && (
              <span>
                {evaluations.length} évaluation
                {evaluations.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </header>

        {ressources.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-lg font-bold text-slate-900">
              Aucun support disponible
            </h2>

            <p className="mt-2 text-slate-600">
              Le formateur n'a pas encore ajouté
              de ressource à ce cours.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            {documents.length > 0 && (
              <section>
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-slate-900">
                    Documents
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Supports PDF, Word, PowerPoint
                    et autres documents du cours.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                 {documents.map((ressource) => {
  const fichierLocal =
    estFichier(ressource);

  return (
    <article
      key={ressource.id}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
            {ressource.type}
          </p>

          <h3 className="mt-2 text-lg font-bold text-slate-900">
            {ressource.nom}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Ajouté le{" "}
            {new Date(
              ressource.createdAt
            ).toLocaleDateString(
              "fr-FR"
            )}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
          📄
        </div>
      </div>

      {fichierLocal ? (
        <button
          type="button"
          onClick={() =>
            handleTelecharger(
              ressource
            )
          }
          disabled={
            downloadingId ===
            ressource.id
          }
          className="mt-6 inline-flex items-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloadingId ===
          ressource.id
            ? "Téléchargement..."
            : "Télécharger"}
        </button>
      ) : (
        <a
          href={ressource.url}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Ouvrir le document
        </a>
      )}
    </article>
  );
})}
                </div>
              </section>
            )}

            {videos.length > 0 && (
              <section>
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-slate-900">
                    Vidéos
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Contenus vidéo associés au cours.
                  </p>
                </div>

                <div className="space-y-4">
                  {videos.map((ressource) => (
                    <article
                      key={ressource.id}
                      className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-900">
                          ▶
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                            Vidéo
                          </p>

                          <h3 className="mt-1 font-bold text-slate-900">
                            {ressource.nom}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            Ajoutée le{" "}
                            {new Date(
                              ressource.createdAt
                            ).toLocaleDateString(
                              "fr-FR"
                            )}
                          </p>
                        </div>
                      </div>

                      <a
                    
                       href={ressource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 rounded-xl bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-cyan-700"
                      >
                        Regarder
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {liens.length > 0 && (
              <section>
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-slate-900">
                    Liens utiles
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Ressources complémentaires
                    recommandées par le formateur.
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {liens.map(
                    (ressource, index) => (
                      <a
                        key={ressource.id}
                        href={ressource.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center justify-between gap-5 p-5 transition hover:bg-slate-50 ${
                          index !==
                          liens.length - 1
                            ? "border-b border-slate-100"
                            : ""
                        }`}
                      >
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                            Lien externe
                          </p>

                          <h3 className="mt-1 font-semibold text-slate-900">
                            {ressource.nom}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            Ajouté le{" "}
                            {new Date(
                              ressource.createdAt
                            ).toLocaleDateString(
                              "fr-FR"
                            )}
                          </p>
                        </div>

                        <span className="text-xl text-cyan-700">
                          ↗
                        </span>
                      </a>
                    )
                  )}
                </div>
              </section>
            )}

            {autres.length > 0 && (
              <section>
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-slate-900">
                    Autres ressources
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Supports complémentaires
                    disponibles pour ce cours.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {autres.map((ressource) => (
                    <article
                      key={ressource.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                        {ressource.type}
                      </p>

                      <h3 className="mt-2 font-bold text-slate-900">
                        {ressource.nom}
                      </h3>

                     <a
                        href={ressource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex text-sm font-semibold text-cyan-700 hover:text-cyan-900"
                      >
                        Ouvrir →
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <section className="mt-12 border-t border-slate-200 pt-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Évaluations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Vérifiez vos connaissances sur ce cours.
            </p>
          </div>

          {evaluations.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <p className="text-sm text-slate-600">
                Aucune évaluation n'est disponible
                pour ce cours.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {evaluations.map(
                (evaluation) => {
                  const dejaSoumis =
                    evaluation.soumissions.length >
                    0;

                  return (
                    <article
                      key={evaluation.id}
                      className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                            {evaluation.type}
                          </span>

                          <span className="flex items-center gap-2 text-sm text-slate-500">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                dejaSoumis
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            />

                            {dejaSoumis
                              ? "Déjà soumis"
                              : "À faire"}
                          </span>
                        </div>

                        <h3 className="mt-2 text-lg font-bold text-slate-900">
                          {evaluation.titre}
                        </h3>

                        {evaluation.description && (
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            {
                              evaluation.description
                            }
                          </p>
                        )}
                      </div>

                      {dejaSoumis ? (
                        <Link
                          to="/apprenant/resultats"
                          className="shrink-0 rounded-xl border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Voir le résultat
                        </Link>
                      ) : evaluation.type ===
                        "QCM" ? (
                        <Link
                          to={`/apprenant/evaluations/${evaluation.id}/qcm`}
                          className="shrink-0 rounded-xl bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-cyan-700"
                        >
                          Passer le QCM
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="shrink-0 cursor-not-allowed rounded-xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-500"
                        >
                          Indisponible
                        </button>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>
        {coursId && <ExercicesSection coursId={coursId} isFormateur={false} />}
      </div>
    </div>
  );
}

export default CoursPage;