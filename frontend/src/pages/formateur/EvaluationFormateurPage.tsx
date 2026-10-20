import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import {
  ajouterQuestionQCM,
  getEvaluationFormateur,
  modifierQuestionQCM,
  supprimerQuestionQCM,
  type EvaluationDetailFormateur,
  type QuestionFormateur,
} from "../../services/evaluation.service";

interface ChoixFormulaire {
  texte: string;
  correct: boolean;
}

const CHOIX_INITIAUX: ChoixFormulaire[] = [
  { texte: "", correct: true },
  { texte: "", correct: false },
];

function EvaluationFormateurPage() {
  const { evaluationId } = useParams();

  const [evaluation, setEvaluation] =
    useState<EvaluationDetailFormateur | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showQuestions, setShowQuestions] = useState(true);

  // ---------- Ajout d'une question ----------
  const [contenu, setContenu] = useState("");
  const [choix, setChoix] =
    useState<ChoixFormulaire[]>(CHOIX_INITIAUX);
  const [saving, setSaving] = useState(false);
  const [questionError, setQuestionError] = useState("");
  const [success, setSuccess] = useState("");

  // ---------- Modification d'une question ----------
  const [editingQuestionId, setEditingQuestionId] =
    useState<string | null>(null);
  const [editContenu, setEditContenu] = useState("");
  const [editChoix, setEditChoix] = useState<ChoixFormulaire[]>([]);
  const [savingQuestionEdit, setSavingQuestionEdit] =
    useState(false);
  const [questionActionError, setQuestionActionError] =
    useState("");

  const qcmVerrouille = evaluation?.verrouille ?? false;

  useEffect(() => {
    async function chargerEvaluation() {
      if (!evaluationId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getEvaluationFormateur(evaluationId);
        setEvaluation(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger cette évaluation.");
      } finally {
        setLoading(false);
      }
    }

    chargerEvaluation();
  }, [evaluationId]);

  // ======================================================
  // FORMULAIRE D'AJOUT
  // ======================================================

  function modifierTexteChoix(index: number, texte: string) {
    setChoix((current) =>
      current.map((item, position) =>
        position === index ? { ...item, texte } : item
      )
    );
  }

  // Coche / décoche une bonne réponse (plusieurs possibles)
  function basculerBonneReponse(index: number) {
    setChoix((current) =>
      current.map((item, position) =>
        position === index
          ? { ...item, correct: !item.correct }
          : item
      )
    );
  }

  function ajouterChoix() {
    setChoix((current) => [
      ...current,
      { texte: "", correct: false },
    ]);
  }

  function supprimerChoix(index: number) {
    if (choix.length <= 2) {
      return;
    }

    setChoix(choix.filter((_, position) => position !== index));
  }

  async function handleAjouterQuestion(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!evaluationId) {
      return;
    }

    setQuestionError("");
    setSuccess("");

    if (!contenu.trim()) {
      setQuestionError(
        "Le texte de la question est obligatoire."
      );
      return;
    }

    const choixValides = choix.filter(
      (item) => item.texte.trim() !== ""
    );

    if (choixValides.length < 2) {
      setQuestionError(
        "Une question doit contenir au moins deux choix."
      );
      return;
    }

    if (!choixValides.some((item) => item.correct)) {
      setQuestionError(
        "Vous devez sélectionner au moins une bonne réponse."
      );
      return;
    }

    try {
      setSaving(true);

      await ajouterQuestionQCM(evaluationId, {
        contenu: contenu.trim(),
        choix: choixValides.map((item) => ({
          texte: item.texte.trim(),
          correct: item.correct,
        })),
      });

      const data = await getEvaluationFormateur(evaluationId);
      setEvaluation(data);

      setContenu("");
      setChoix(CHOIX_INITIAUX);
      setSuccess("Question ajoutée avec succès.");
    } catch (err: unknown) {
      console.error("Erreur ajout question :", err);

      if (axios.isAxiosError(err)) {
        setQuestionError(
          err.response?.data?.message ??
            "Impossible d'ajouter cette question."
        );
      } else {
        setQuestionError("Impossible d'ajouter cette question.");
      }
    } finally {
      setSaving(false);
    }
  }

  // ======================================================
  // FORMULAIRE DE MODIFICATION
  // ======================================================

  function commencerModificationQuestion(
    question: QuestionFormateur
  ) {
    setEditingQuestionId(question.id);
    setEditContenu(question.contenu);

    setEditChoix(
      question.choix.map((item, index) => ({
        texte: item.texte,
        correct:
          item.correct === true ||
          (item.correct === undefined && index === 0),
      }))
    );

    setQuestionActionError("");
  }

  function modifierTexteChoixEdition(
    index: number,
    texte: string
  ) {
    setEditChoix((current) =>
      current.map((item, position) =>
        position === index ? { ...item, texte } : item
      )
    );
  }

  function basculerBonneReponseEdition(index: number) {
    setEditChoix((current) =>
      current.map((item, position) =>
        position === index
          ? { ...item, correct: !item.correct }
          : item
      )
    );
  }

  function ajouterChoixEdition() {
    setEditChoix((current) => [
      ...current,
      { texte: "", correct: false },
    ]);
  }

  function supprimerChoixEdition(index: number) {
    if (editChoix.length <= 2) {
      return;
    }

    setEditChoix(
      editChoix.filter((_, position) => position !== index)
    );
  }

  async function handleModifierQuestion(
    event: React.FormEvent<HTMLFormElement>,
    questionId: string
  ) {
    event.preventDefault();

    if (!evaluationId) {
      return;
    }

    setQuestionActionError("");

    if (!editContenu.trim()) {
      setQuestionActionError(
        "Le texte de la question est obligatoire."
      );
      return;
    }

    const choixValides = editChoix.filter(
      (item) => item.texte.trim() !== ""
    );

    if (choixValides.length < 2) {
      setQuestionActionError(
        "La question doit contenir au moins deux choix."
      );
      return;
    }

    if (!choixValides.some((item) => item.correct)) {
      setQuestionActionError(
        "Vous devez sélectionner au moins une bonne réponse."
      );
      return;
    }

    try {
      setSavingQuestionEdit(true);

      await modifierQuestionQCM(questionId, {
        contenu: editContenu.trim(),
        choix: choixValides.map((item) => ({
          texte: item.texte.trim(),
          correct: item.correct,
        })),
      });

      const data = await getEvaluationFormateur(evaluationId);

      setEvaluation(data);
      setEditingQuestionId(null);
    } catch (err: unknown) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        setQuestionActionError(
          err.response?.data?.message ??
            "Impossible de modifier la question."
        );
      } else {
        setQuestionActionError(
          "Impossible de modifier la question."
        );
      }
    } finally {
      setSavingQuestionEdit(false);
    }
  }

  async function handleSupprimerQuestion(questionId: string) {
    if (!evaluationId) {
      return;
    }

    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer cette question ?"
    );

    if (!confirmation) {
      return;
    }

    try {
      setQuestionActionError("");

      await supprimerQuestionQCM(questionId);

      const data = await getEvaluationFormateur(evaluationId);

      setEvaluation(data);
    } catch (err: unknown) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        setQuestionActionError(
          err.response?.data?.message ??
            "Impossible de supprimer la question."
        );
      } else {
        setQuestionActionError(
          "Impossible de supprimer la question."
        );
      }
    }
  }

  // ======================================================
  // RENDU
  // ======================================================

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Chargement de l'évaluation...
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-red-600">
          {error || "Évaluation introuvable."}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <Link
          to={`/formateur/cours/${evaluation.cours.id}`}
          className="text-sm font-semibold text-cyan-700 hover:text-cyan-900"
        >
          ← Retour au cours
        </Link>

        <header className="mt-6 border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            {evaluation.type}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {evaluation.titre}
          </h1>

          {evaluation.description && (
            <p className="mt-3 max-w-3xl text-slate-600">
              {evaluation.description}
            </p>
          )}

          <p className="mt-4 text-sm text-slate-500">
            {evaluation.questions.length} question
            {evaluation.questions.length > 1 ? "s" : ""}
          </p>

          {qcmVerrouille && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Ce QCM est verrouillé car des apprenants ont déjà
              soumis leurs réponses.
            </div>
          )}
        </header>

        {/* ---------- QUESTIONS EXISTANTES ---------- */}

        <section className="mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Questions du QCM
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Questions déjà enregistrées dans cette évaluation.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowQuestions((current) => !current)
              }
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {showQuestions
                ? "Masquer les questions"
                : "Afficher les questions"}
            </button>
          </div>

          {showQuestions && (
            <>
              {evaluation.questions.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8">
                  <p className="text-sm text-slate-600">
                    Aucune question n'a encore été ajoutée.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {evaluation.questions.map((question, index) => (
                    <article
                      key={question.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                        Question {index + 1}
                      </p>

                      <h3 className="mt-2 font-bold text-slate-900">
                        {question.contenu}
                      </h3>

                      <div className="mt-4 space-y-2">
                        {question.choix.map((item, position) => (
                          <div
                            key={item.id}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                              item.correct
                                ? "border border-emerald-200 bg-emerald-50 text-slate-700"
                                : "bg-slate-50 text-slate-700"
                            }`}
                          >
                            <span className="font-semibold text-slate-400">
                              {String.fromCharCode(65 + position)}
                            </span>

                            <span className="flex-1">
                              {item.texte}
                            </span>

                            {item.correct && (
                              <span className="text-xs font-semibold text-emerald-700">
                                Bonne réponse
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {!qcmVerrouille && (
                        <div className="mt-5 flex flex-wrap justify-end gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              commencerModificationQuestion(
                                question
                              )
                            }
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleSupprimerQuestion(question.id)
                            }
                            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Supprimer
                          </button>
                        </div>
                      )}

                      {!qcmVerrouille &&
                        editingQuestionId === question.id && (
                          <form
                            onSubmit={(event) =>
                              handleModifierQuestion(
                                event,
                                question.id
                              )
                            }
                            className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5"
                          >
                            <h4 className="font-semibold text-slate-900">
                              Modifier la question
                            </h4>

                            <div className="mt-4">
                              <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Question
                              </label>

                              <textarea
                                value={editContenu}
                                onChange={(event) =>
                                  setEditContenu(event.target.value)
                                }
                                rows={3}
                                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-cyan-600"
                              />
                            </div>

                            <div className="mt-5">
                              <div className="flex items-center justify-between gap-4">
                                <p className="font-semibold text-slate-800">
                                  Choix de réponse
                                </p>

                                <button
                                  type="button"
                                  onClick={ajouterChoixEdition}
                                  className="text-sm font-semibold text-cyan-700 hover:text-cyan-900"
                                >
                                  + Ajouter un choix
                                </button>
                              </div>

                              <div className="mt-4 space-y-3">
                                {editChoix.map((item, position) => (
                                  <div
                                    key={position}
                                    className="flex items-center gap-3"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={item.correct}
                                      onChange={() =>
                                        basculerBonneReponseEdition(
                                          position
                                        )
                                      }
                                      className="h-4 w-4 accent-cyan-600"
                                    />

                                    <input
                                      type="text"
                                      value={item.texte}
                                      onChange={(event) =>
                                        modifierTexteChoixEdition(
                                          position,
                                          event.target.value
                                        )
                                      }
                                      className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-cyan-600"
                                    />

                                    {editChoix.length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          supprimerChoixEdition(
                                            position
                                          )
                                        }
                                        className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                      >
                                        Supprimer
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <p className="mt-3 text-xs text-slate-500">
                                Cochez une ou plusieurs bonnes
                                réponses.
                              </p>
                            </div>

                            {questionActionError && (
                              <p className="mt-4 text-sm text-red-600">
                                {questionActionError}
                              </p>
                            )}

                            <div className="mt-5 flex justify-end gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingQuestionId(null);
                                  setQuestionActionError("");
                                }}
                                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                              >
                                Annuler
                              </button>

                              <button
                                type="submit"
                                disabled={savingQuestionEdit}
                                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {savingQuestionEdit
                                  ? "Enregistrement..."
                                  : "Enregistrer"}
                              </button>
                            </div>
                          </form>
                        )}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* ---------- AJOUT D'UNE QUESTION ---------- */}

        {!qcmVerrouille && (
          <section className="mt-12 border-t border-slate-200 pt-10">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Ajouter une question
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Ajoutez plusieurs choix et cochez une ou plusieurs
                bonnes réponses. Une question est comptée juste
                seulement si l'apprenant coche exactement les
                bonnes réponses.
              </p>
            </div>

            <form
              onSubmit={handleAjouterQuestion}
              className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div>
                <label
                  htmlFor="question"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Question
                </label>

                <textarea
                  id="question"
                  value={contenu}
                  onChange={(event) =>
                    setContenu(event.target.value)
                  }
                  rows={3}
                  placeholder="Ex : Quels langages sont utilisés avec React ?"
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-600"
                />
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-slate-900">
                    Choix de réponse
                  </h3>

                  <button
                    type="button"
                    onClick={ajouterChoix}
                    className="text-sm font-semibold text-cyan-700 hover:text-cyan-900"
                  >
                    + Ajouter un choix
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {choix.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={item.correct}
                        onChange={() =>
                          basculerBonneReponse(index)
                        }
                        className="h-4 w-4 accent-cyan-600"
                      />

                      <input
                        type="text"
                        value={item.texte}
                        onChange={(event) =>
                          modifierTexteChoix(
                            index,
                            event.target.value
                          )
                        }
                        placeholder={`Choix ${index + 1}`}
                        className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-600"
                      />

                      {choix.length > 2 && (
                        <button
                          type="button"
                          onClick={() => supprimerChoix(index)}
                          className="rounded-xl border border-red-200 px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Les cases cochées indiquent les bonnes réponses.
                </p>
              </div>

              {questionError && (
                <p className="mt-5 text-sm text-red-600">
                  {questionError}
                </p>
              )}

              {success && (
                <p className="mt-5 text-sm text-emerald-600">
                  {success}
                </p>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Ajout..." : "Ajouter la question"}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}

export default EvaluationFormateurPage;