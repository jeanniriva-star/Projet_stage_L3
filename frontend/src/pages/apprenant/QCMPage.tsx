import { useEffect, useState } from "react";
import { Link, useParams,useNavigate } from "react-router-dom";
import axios from "axios";

import {
  getQCM,
  soumettreQCM,
  getMesEvaluations,
  type QCM,
} from "../../services/evaluation.service";

function QCMPage() {
  const { evaluationId } = useParams();
  

  const [qcm, setQcm] = useState<QCM | null>(null);

  const [reponses, setReponses] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [resultat, setResultat] = useState<{
    noteSur20: number;
    bonnesReponses: number;
    nombreQuestions: number;
  } | null>(null);

  useEffect(() => {
    async function chargerQCM() {
      if (!evaluationId) {
        setLoading(false);
        return;
      }

      try {

        const evaluations = await getMesEvaluations();

const evaluation = evaluations.find(
  (item) => item.id === evaluationId
);

if (evaluation && evaluation.soumissions.length > 0) {
  navigate("/apprenant/resultats", {
    replace: true,
  });

  return;
}
        const data = await getQCM(evaluationId);

        console.log("QCM reçu :", data);

        setQcm(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger ce QCM.");
      } finally {
        setLoading(false);
      }
    }

    chargerQCM();
  }, [evaluationId,navigate]);

  function choisirReponse(
    questionId: string,
    choixId: string
  ) {
    setReponses((prev) => ({
      ...prev,
      [questionId]: choixId,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!qcm || !evaluationId) {
      return;
    }

    if (qcm.questions.length === 0) {
      setError("Ce QCM ne contient aucune question.");
      return;
    }

    if (
      Object.keys(reponses).length !==
      qcm.questions.length
    ) {
      setError(
        "Vous devez répondre à toutes les questions."
      );
      return;
    }

    try {
      setSending(true);
      setError("");

      const payload = qcm.questions.map(
        (question) => ({
          questionId: question.id,
          choixId: reponses[question.id],
        })
      );

      console.log("Payload QCM :", payload);

      const data = await soumettreQCM(
        evaluationId,
        payload
      );

      setResultat(data.resultat);
    } catch (err: unknown) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        console.log(
          "Réponse backend :",
          err.response?.data
        );

        setError(
          err.response?.data?.message ||
            "Impossible de soumettre le QCM."
        );
      } else {
        setError(
          "Impossible de soumettre le QCM."
        );
      }
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Chargement du QCM...
      </div>
    );
  }

  if (error && !qcm) {
    return (
      <div className="p-8 text-red-600">
        {error}
      </div>
    );
  }

  if (!qcm) {
    return null;
  }

  if (resultat) {
   
    return (
      <div className="px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
              Résultat
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              QCM terminé
            </h1>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-5">
                <p className="text-sm text-slate-500">
                  Note
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {resultat.noteSur20}/20
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-5">
                <p className="text-sm text-slate-500">
                  Bonnes réponses
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {resultat.bonnesReponses}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-5">
                <p className="text-sm text-slate-500">
                  Questions
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {resultat.nombreQuestions}
                </p>
              </div>
            </div>

            <Link
            to="/apprenant/evaluations"
            className="mt-8 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-cyan-700"
            >
            Retour aux évaluations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            QCM
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {qcm.titre}
          </h1>

          {qcm.description && (
            <p className="mt-3 text-slate-600">
              {qcm.description}
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {qcm.questions.map(
            (question, index) => (
              <article
                key={question.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                  Question {index + 1}
                </p>

                <h2 className="mt-2 text-lg font-bold text-slate-900">
                  {question.contenu}
                </h2>

                <div className="mt-5 space-y-3">
                  {question.choix.map(
                    (choix) => (
                      <label
                        key={choix.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                          reponses[question.id] ===
                          choix.id
                            ? "border-cyan-500 bg-cyan-50"
                            : "border-slate-200 bg-white hover:border-cyan-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={choix.id}
                          checked={
                            reponses[
                              question.id
                            ] === choix.id
                          }
                          onChange={() =>
                            choisirReponse(
                              question.id,
                              choix.id
                            )
                          }
                          className="accent-cyan-600"
                        />

                        <span className="text-sm text-slate-700">
                          {choix.texte}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </article>
            )
          )}

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-xl bg-slate-950 px-5 py-4 font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-50"
          >
            {sending
              ? "Soumission..."
              : "Soumettre le QCM"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default QCMPage;