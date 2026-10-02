import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import axios from "axios";

import {
  getRessourcesCours,
  type RessourceCours,
} from "../../services/ressource.service";

import {
  getEvaluationsFormation,
  type EvaluationFormateur,
} from "../../services/evaluation.service";

function CoursDetailAdminPage() {
  const {
    formationId,
    coursId,
  } = useParams<{
    formationId: string;
    coursId: string;
  }>();

  const [
    titreCours,
    setTitreCours,
  ] = useState("");

  const [
    titreFormation,
    setTitreFormation,
  ] = useState("");

  const [
    ressources,
    setRessources,
  ] = useState<RessourceCours[]>([]);

  const [
    evaluations,
    setEvaluations,
  ] = useState<EvaluationFormateur[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    let annule = false;

    async function chargerCours() {
      if (!coursId) {
        setError(
          "Identifiant du cours manquant."
        );

        setLoading(false);
        return;
      }

      try {
        const dataRessources =
          await getRessourcesCours(
            coursId
          );

        const formationDuCours =
          dataRessources.cours
            .formation;

        const toutesLesEvaluations =
          await getEvaluationsFormation(
            formationDuCours.id
          );

        if (annule) {
          return;
        }

        setTitreCours(
          dataRessources.cours.titre
        );

        setTitreFormation(
          formationDuCours.titre
        );

        setRessources(
          dataRessources.ressources
        );

        setEvaluations(
          toutesLesEvaluations.filter(
            (evaluation) =>
              evaluation.cours.id ===
              coursId
          )
        );
      } catch (err: unknown) {
        if (annule) {
          return;
        }

        console.error(
          "Erreur détail cours admin :",
          err
        );

        if (
          axios.isAxiosError(err)
        ) {
          setError(
            err.response?.data
              ?.message ??
              "Impossible de charger ce cours."
          );
        } else {
          setError(
            "Impossible de charger ce cours."
          );
        }
      } finally {
        if (!annule) {
          setLoading(false);
        }
      }
    }

    chargerCours();

    return () => {
      annule = true;
    };
  }, [coursId]);

  function typeLabel(
    type: string
  ) {
    switch (
      type.toUpperCase()
    ) {
      case "PDF":
        return "PDF";

      case "WORD":
        return "Document Word";

      case "DOCUMENT":
        return "Document";

      case "POWERPOINT":
        return "PowerPoint";

      case "VIDEO":
        return "Vidéo";

      case "LIEN":
        return "Lien externe";

      default:
        return type;
    }
  }

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
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">

        {/* FIL D'ARIANE */}

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            to="/admin/formations"
            className="font-semibold text-cyan-700 hover:text-cyan-900"
          >
            Formations
          </Link>

          <span className="text-slate-400">
            /
          </span>

          <Link
            to={`/admin/formations/${formationId}`}
            className="font-semibold text-cyan-700 hover:text-cyan-900"
          >
            {titreFormation}
          </Link>

          <span className="text-slate-400">
            /
          </span>

          <span className="text-slate-500">
            {titreCours}
          </span>
        </div>

        {/* HEADER */}

        <header className="mt-6 border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Cours
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {titreCours}
          </h1>

          <div className="mt-5 flex flex-wrap gap-6 text-sm text-slate-500">
            <span>
              {ressources.length} ressource
              {ressources.length > 1
                ? "s"
                : ""}
            </span>

            <span>
              {evaluations.length} évaluation
              {evaluations.length > 1
                ? "s"
                : ""}
            </span>
          </div>
        </header>

        {/* RESSOURCES */}

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Ressources pédagogiques
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tous les supports associés
              à ce cours.
            </p>
          </div>

          {ressources.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Aucune ressource pour ce
              cours.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-950">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white">
                        Ressource
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white">
                        Type
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white">
                        Ajoutée le
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-white">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {ressources.map(
                      (ressource) => (
                        <tr
                          key={
                            ressource.id
                          }
                          className="hover:bg-slate-50"
                        >
                          <td className="px-5 py-4 font-semibold text-slate-900">
                            {
                              ressource.nom
                            }
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                              {typeLabel(
                                ressource.type
                              )}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                            {new Date(
                              ressource.createdAt
                            ).toLocaleDateString(
                              "fr-FR"
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            {ressource.url.startsWith(
                              "http://"
                            ) ||
                            ressource.url.startsWith(
                              "https://"
                            ) ? (
                              <a
                                href={
                                  ressource.url
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm font-semibold text-cyan-700 hover:text-cyan-900"
                              >
                                Ouvrir ↗
                              </a>
                            ) : (
                              <span className="text-sm text-slate-400">
                                Fichier interne
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* EVALUATIONS */}

        <section className="mt-12 border-t border-slate-200 pt-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Évaluations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Cliquez sur une évaluation
              pour consulter ses questions
              et ses résultats.
            </p>
          </div>

          {evaluations.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Aucune évaluation associée
              à ce cours.
            </div>
          ) : (
            <div className="space-y-3">
              {evaluations.map(
                (evaluation) => (
                  <Link
                    key={
                      evaluation.id
                    }
                    to={`/admin/formations/${formationId}/cours/${coursId}/evaluations/${evaluation.id}`}
                    className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50/30"
                  >
                    <div className="flex items-center justify-between gap-5">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-bold text-slate-900">
                            {
                              evaluation.titre
                            }
                          </h3>

                          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                            {
                              evaluation.type
                            }
                          </span>
                        </div>

                        {evaluation.description && (
                          <p className="mt-2 text-sm text-slate-500">
                            {
                              evaluation.description
                            }
                          </p>
                        )}
                      </div>

                      <span className="text-xl text-slate-400">
                        →
                      </span>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default CoursDetailAdminPage;