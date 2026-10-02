import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import axios from "axios";

import {
  getEvaluationDetailAdmin,
  getResultatsEvaluationAdmin,
  type EvaluationDetailAdmin,
  type ResultatEvaluationAdmin,
} from "../../services/evaluation.service";

function EvaluationDetailAdminPage() {
  const {
    formationId,
    coursId,
    evaluationId,
  } = useParams<{
    formationId: string;
    coursId: string;
    evaluationId: string;
  }>();

  const [
    evaluation,
    setEvaluation,
  ] = useState<EvaluationDetailAdmin | null>(
    null
  );

  const [
    soumissions,
    setSoumissions,
  ] = useState<ResultatEvaluationAdmin[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    recherche,
    setRecherche,
  ] = useState("");

  const [
    noteMin,
    setNoteMin,
  ] = useState("");

  const [
    noteMax,
    setNoteMax,
  ] = useState("");

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  const [
    total,
    setTotal,
  ] = useState(0);

  async function chargerResultats(
    pageDemandee = page,
    rechercheDemandee = recherche,
    noteMinDemandee = noteMin,
    noteMaxDemandee = noteMax
  ) {
    if (!evaluationId) {
      return;
    }

    const min =
      noteMinDemandee.trim() === ""
        ? undefined
        : Number(noteMinDemandee);

    const max =
      noteMaxDemandee.trim() === ""
        ? undefined
        : Number(noteMaxDemandee);

    const data =
      await getResultatsEvaluationAdmin(
        evaluationId,
        pageDemandee,
        10,
        rechercheDemandee,
        min,
        max
      );

    setSoumissions(
      data.soumissions
    );

    setPage(
      data.pagination.page
    );

    setTotalPages(
      data.pagination.totalPages
    );

    setTotal(
      data.pagination.total
    );
  }

  useEffect(() => {
    let annule = false;

    async function charger() {
      if (!evaluationId) {
        setError(
          "Identifiant de l'évaluation manquant."
        );

        setLoading(false);
        return;
      }

      try {
        const [
          evaluationData,
          resultatsData,
        ] = await Promise.all([
          getEvaluationDetailAdmin(
            evaluationId
          ),

          getResultatsEvaluationAdmin(
            evaluationId,
            1,
            10,
            ""
          ),
        ]);

        if (annule) {
          return;
        }

        setEvaluation(
          evaluationData
        );

        setSoumissions(
          resultatsData.soumissions
        );

        setPage(
          resultatsData.pagination.page
        );

        setTotalPages(
          resultatsData.pagination.totalPages
        );

        setTotal(
          resultatsData.pagination.total
        );
      } catch (err: unknown) {
        if (annule) {
          return;
        }

        console.error(
          "Erreur détail évaluation admin :",
          err
        );

        if (
          axios.isAxiosError(err)
        ) {
          setError(
            err.response?.data?.message ??
              "Impossible de charger l'évaluation."
          );
        } else {
          setError(
            "Impossible de charger l'évaluation."
          );
        }
      } finally {
        if (!annule) {
          setLoading(false);
        }
      }
    }

    charger();

    return () => {
      annule = true;
    };
  }, [evaluationId]);

  async function handleRecherche(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      await chargerResultats(
        1,
        recherche,
        noteMin,
        noteMax
      );
    } catch (err: unknown) {
      console.error(
        "Erreur recherche résultats :",
        err
      );

      if (
        axios.isAxiosError(err)
      ) {
        window.alert(
          err.response?.data?.message ??
            "Impossible de filtrer les résultats."
        );
      }
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Chargement de l'évaluation...
      </div>
    );
  }

  if (
    error ||
    !evaluation
  ) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error ||
            "Évaluation introuvable."}
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
            {
              evaluation.cours
                .formation.titre
            }
          </Link>

          <span className="text-slate-400">
            /
          </span>

          <Link
            to={`/admin/formations/${formationId}/cours/${coursId}`}
            className="font-semibold text-cyan-700 hover:text-cyan-900"
          >
            {
              evaluation.cours.titre
            }
          </Link>

          <span className="text-slate-400">
            /
          </span>

          <span className="text-slate-500">
            {evaluation.titre}
          </span>
        </div>

        {/* HEADER */}

        <header className="mt-6 border-b border-slate-200 pb-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
              Évaluation
            </p>

            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
              {evaluation.type}
            </span>

            {evaluation.verrouille && (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                Verrouillée
              </span>
            )}
          </div>

          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            {evaluation.titre}
          </h1>

          {evaluation.description && (
            <p className="mt-3 max-w-3xl text-slate-600">
              {
                evaluation.description
              }
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-6 text-sm text-slate-500">
            <span>
              {
                evaluation.nombreQuestions
              }{" "}
              question
              {evaluation.nombreQuestions > 1
                ? "s"
                : ""}
            </span>

            <span>
              {
                evaluation.nombreSoumissions
              }{" "}
              soumission
              {evaluation.nombreSoumissions > 1
                ? "s"
                : ""}
            </span>
          </div>
        </header>

        {/* QUESTIONS */}

        <section className="mt-10">
          <h2 className="text-xl font-bold text-slate-900">
            Questions et choix
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Les bonnes réponses sont
            visibles uniquement dans
            cette vue administrative.
          </p>

          {evaluation.questions.length ===
          0 ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Cette évaluation ne contient
              aucune question.
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              {evaluation.questions.map(
                (
                  question,
                  index
                ) => (
                  <article
                    key={
                      question.id
                    }
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                      Question{" "}
                      {index + 1}
                    </p>

                    <h3 className="mt-2 font-bold text-slate-900">
                      {
                        question.contenu
                      }
                    </h3>

                    <div className="mt-4 space-y-2">
                      {question.choix.map(
                        (choix) => (
                          <div
                            key={
                              choix.id
                            }
                            className={
                              choix.correct
                                ? "flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
                                : "flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
                            }
                          >
                            <span className="text-sm text-slate-700">
                              {
                                choix.texte
                              }
                            </span>

                            {choix.correct && (
                              <span className="text-xs font-semibold text-emerald-700">
                                Bonne réponse
                              </span>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>

        {/* RESULTATS */}

        <section className="mt-12 border-t border-slate-200 pt-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Résultats des apprenants
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Consultez les notes et
              les dates de soumission.
            </p>
          </div>

          <form
            onSubmit={
              handleRecherche
            }
            className="mt-6 grid gap-3 md:grid-cols-[1fr_140px_140px_auto]"
          >
            <input
              type="search"
              value={
                recherche
              }
              onChange={(event) =>
                setRecherche(
                  event.target.value
                )
              }
              placeholder="Nom, prénom ou email..."
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-cyan-600"
            />

            <input
              type="number"
              min="0"
              max="20"
              step="0.01"
              value={
                noteMin
              }
              onChange={(event) =>
                setNoteMin(
                  event.target.value
                )
              }
              placeholder="Note min"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-cyan-600"
            />

            <input
              type="number"
              min="0"
              max="20"
              step="0.01"
              value={
                noteMax
              }
              onChange={(event) =>
                setNoteMax(
                  event.target.value
                )
              }
              placeholder="Note max"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-cyan-600"
            />

            <button
              type="submit"
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Filtrer
            </button>
          </form>

          {(recherche ||
            noteMin ||
            noteMax) && (
            <button
              type="button"
              onClick={() => {
                setRecherche("");
                setNoteMin("");
                setNoteMax("");

                void chargerResultats(
                  1,
                  "",
                  "",
                  ""
                );
              }}
              className="mt-3 text-sm font-semibold text-cyan-700"
            >
              Réinitialiser les filtres
            </button>
          )}

          {soumissions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Aucune soumission trouvée.
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-950">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-white">
                        Apprenant
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-white">
                        Email
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-semibold uppercase text-white">
                        Note
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-white">
                        Soumis le
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {soumissions.map(
                      (soumission) => (
                        <tr
                          key={
                            soumission.id
                          }
                          className="hover:bg-slate-50"
                        >
                          <td className="px-5 py-4 font-semibold text-slate-900">
                            {
                              soumission.inscription
                                .apprenant.prenom
                            }{" "}
                            {
                              soumission.inscription
                                .apprenant.nom
                            }
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {
                              soumission.inscription
                                .apprenant.email
                            }
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span className="font-bold text-slate-900">
                              {soumission.note ??
                                "-"}
                              /20
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                            {new Date(
                              soumission.dateSoumission
                            ).toLocaleString(
                              "fr-FR"
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

          {!loading &&
            totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between gap-4">
                <button
                  type="button"
                  disabled={
                    page <= 1
                  }
                  onClick={() =>
                    void chargerResultats(
                      page - 1,
                      recherche,
                      noteMin,
                      noteMax
                    )
                  }
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40"
                >
                  ← Précédent
                </button>

                <p className="text-sm text-slate-500">
                  {total} résultat
                  {total > 1
                    ? "s"
                    : ""}{" "}
                  — Page {page} sur{" "}
                  {totalPages}
                </p>

                <button
                  type="button"
                  disabled={
                    page >=
                    totalPages
                  }
                  onClick={() =>
                    void chargerResultats(
                      page + 1,
                      recherche,
                      noteMin,
                      noteMax
                    )
                  }
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40"
                >
                  Suivant →
                </button>
              </div>
            )}
        </section>
      </div>
    </div>
  );
}

export default EvaluationDetailAdminPage;