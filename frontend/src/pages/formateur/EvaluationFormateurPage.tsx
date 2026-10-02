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

function EvaluationFormateurPage() {
  const { evaluationId } = useParams();

  const [evaluation, setEvaluation] =
    useState<EvaluationDetailFormateur | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [contenu, setContenu] = useState("");
  const [showQuestions, setShowQuestions] =
  useState(true);

  const [editingQuestionId, setEditingQuestionId] =
  useState<string | null>(null);

const [editContenu, setEditContenu] =
  useState("");

const [editChoix, setEditChoix] =
  useState<ChoixFormulaire[]>([]);

const [savingQuestionEdit, setSavingQuestionEdit] =
  useState(false);

const [questionActionError, setQuestionActionError] =
  useState("");

  const [choix, setChoix] = useState<ChoixFormulaire[]>([
    {
      texte: "",
      correct: true,
    },
    {
      texte: "",
      correct: false,
    },
  ]);
const qcmVerrouille =
  evaluation?.verrouille ?? false;
  const [saving, setSaving] = useState(false);
  const [questionError, setQuestionError] = useState("");
  const [success, setSuccess] = useState("");

 useEffect(() => {
  async function chargerEvaluation() {
    if (!evaluationId) {
      setLoading(false);
      return;
    }

    try {
      const data =
        await getEvaluationFormateur(evaluationId);

      setEvaluation(data);
    } catch (err) {
      console.error(err);

      setError(
        "Impossible de charger cette évaluation."
      );
    } finally {
      setLoading(false);
    }
  }

  chargerEvaluation();
}, [evaluationId]);

  function modifierTexteChoix(
    index: number,
    texte: string
  ) {
    setChoix((current) =>
      current.map((item, position) =>
        position === index
          ? {
              ...item,
              texte,
            }
          : item
      )
    );
  }

  function definirBonneReponse(index: number) {
    setChoix((current) =>
      current.map((item, position) => ({
        ...item,
        correct: position === index,
      }))
    );
  }

  function ajouterChoix() {
    setChoix((current) => [
      ...current,
      {
        texte: "",
        correct: false,
      },
    ]);
  }

  function supprimerChoix(index: number) {
    if (choix.length <= 2) {
      return;
    }

    const nouveauxChoix = choix.filter(
      (_, position) => position !== index
    );

    if (
      nouveauxChoix.length > 0 &&
      !nouveauxChoix.some(
        (item) => item.correct
      )
    ) {
      nouveauxChoix[0] = {
        ...nouveauxChoix[0],
        correct: true,
      };
    }

    setChoix(nouveauxChoix);
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

    const bonnesReponses =
      choixValides.filter(
        (item) => item.correct
      ).length;

    if (bonnesReponses !== 1) {
      setQuestionError(
        "Vous devez sélectionner exactement une bonne réponse."
      );
      return;
    }

    try {
      setSaving(true);

      await ajouterQuestionQCM(
        evaluationId,
        {
          contenu: contenu.trim(),
          choix: choixValides.map(
            (item) => ({
              texte: item.texte.trim(),
              correct: item.correct,
            })
          ),
        }
      );

     const data =
  await getEvaluationFormateur(evaluationId);

setEvaluation(data);

      setContenu("");

      setChoix([
        {
          texte: "",
          correct: true,
        },
        {
          texte: "",
          correct: false,
        },
      ]);

      setSuccess(
        "Question ajoutée avec succès."
      );
    } catch (err: unknown) {
  console.error("Erreur ajout question :", err);

  if (axios.isAxiosError(err)) {
    console.log(
      "Réponse backend :",
      err.response?.data
    );

    setQuestionError(
      err.response?.data?.message ??
        "Impossible d'ajouter cette question."
    );
  } else {
    setQuestionError(
      "Impossible d'ajouter cette question."
    );
  }

    } finally {
      setSaving(false);
    }
  }
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
      position === index
        ? {
            ...item,
            texte,
          }
        : item
    )
  );
}
function definirBonneReponseEdition(
  index: number
) {
  setEditChoix((current) =>
    current.map((item, position) => ({
      ...item,
      correct: position === index,
    }))
  );
}
function ajouterChoixEdition() {
  setEditChoix((current) => [
    ...current,
    {
      texte: "",
      correct: false,
    },
  ]);
}
function supprimerChoixEdition(
  index: number
) {
  if (editChoix.length <= 2) {
    return;
  }

  const nouveauxChoix =
    editChoix.filter(
      (_, position) => position !== index
    );

  if (
    !nouveauxChoix.some(
      (item) => item.correct
    )
  ) {
    nouveauxChoix[0] = {
      ...nouveauxChoix[0],
      correct: true,
    };
  }

  setEditChoix(nouveauxChoix);
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

  const choixValides =
    editChoix.filter(
      (item) => item.texte.trim() !== ""
    );

  if (choixValides.length < 2) {
    setQuestionActionError(
      "La question doit contenir au moins deux choix."
    );
    return;
  }

  if (
    choixValides.filter(
      (item) => item.correct
    ).length !== 1
  ) {
    setQuestionActionError(
      "Vous devez sélectionner exactement une bonne réponse."
    );
    return;
  }

  try {
    setSavingQuestionEdit(true);

    await modifierQuestionQCM(
      questionId,
      {
        contenu: editContenu.trim(),

        choix: choixValides.map(
          (item) => ({
            texte: item.texte.trim(),
            correct: item.correct,
          })
        ),
      }
    );

    const data =
      await getEvaluationFormateur(
        evaluationId
      );

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

async function handleSupprimerQuestion(
  questionId: string
) {
  if (!evaluationId) {
    return;
  }

  const confirmation =
    window.confirm(
      "Voulez-vous vraiment supprimer cette question ?"
    );

  if (!confirmation) {
    return;
  }

  try {
    setQuestionActionError("");

    await supprimerQuestionQCM(
      questionId
    );

    const data =
      await getEvaluationFormateur(
        evaluationId
      );

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
            {evaluation.questions.length > 1
              ? "s"
              : ""}
          </p>
          {qcmVerrouille && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Ce QCM est verrouillé car des apprenants ont déjà soumis leurs réponses.
            </div>
            )}

        </header>

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
          {evaluation.questions.map(
            (question, index) => (
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
        className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
      >
        <span className="font-semibold text-slate-400">
          {String.fromCharCode(65 + position)}
        </span>

        <span>{item.texte}</span>
      </div>
    ))}
  </div>

  {/* BOUTONS */}
  {!qcmVerrouille && (
  <div className="mt-5 flex flex-wrap justify-end gap-3">
    <button
      type="button"
      onClick={() =>
        commencerModificationQuestion(question)
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

  {/* ✅ FORMULAIRE D'ÉDITION ICI */}
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
          {editChoix.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3"
            >
              <input
                type="radio"
                name={`edit-correct-${question.id}`}
                checked={item.correct}
                onChange={() =>
                  definirBonneReponseEdition(index)
                }
                className="h-4 w-4"
              />

              <input
                type="text"
                value={item.texte}
                onChange={(event) =>
                  modifierTexteChoixEdition(
                    index,
                    event.target.value
                  )
                }
                className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-cyan-600"
              />

              {editChoix.length > 2 && (
                <button
                  type="button"
                  onClick={() =>
                    supprimerChoixEdition(index)
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
          Sélectionnez une seule bonne réponse.
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
            )
          )}
        </div>
      )}
    </>
  )}
</section>
{!qcmVerrouille && (
        <section className="mt-12 border-t border-slate-200 pt-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Ajouter une question
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Ajoutez plusieurs choix et sélectionnez une seule bonne réponse.
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
                  setContenu(
                    event.target.value
                  )
                }
                rows={3}
                placeholder="Ex : Quel langage est principalement utilisé avec React ?"
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
                {choix.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3"
                    >
                      <input
                        type="radio"
                        name="bonne-reponse"
                        checked={
                          item.correct
                        }
                        onChange={() =>
                          definirBonneReponse(
                            index
                          )
                        }
                        className="h-4 w-4"
                      />

                      <input
                        type="text"
                        value={item.texte}
                        onChange={(
                          event
                        ) =>
                          modifierTexteChoix(
                            index,
                            event.target
                              .value
                          )
                        }
                        placeholder={`Choix ${
                          index + 1
                        }`}
                        className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-600"
                      />

                      {choix.length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            supprimerChoix(
                              index
                            )
                          }
                          className="rounded-xl border border-red-200 px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Le bouton radio indique la bonne réponse.
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
                {saving
                  ? "Ajout..."
                  : "Ajouter la question"}
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