import { useState, type FormEvent } from "react";

import { createEvaluationQCM } from "../services/evaluation.service";

export function useEvaluationForm(
  coursId: string | undefined,
  formationId: string,
  rechargerEvaluations: (formationId: string) => Promise<void>
) {
  const [visible, setVisible] = useState(false);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggle() {
    setVisible((current) => !current);
  }

  function annuler() {
    setVisible(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!coursId || !formationId) {
      return;
    }

    if (!titre.trim()) {
      setError("Le titre de l'évaluation est obligatoire.");

      return;
    }

    try {
      setSaving(true);
      setError("");

      await createEvaluationQCM(coursId, {
        titre: titre.trim(),
        description: description.trim() || undefined,
      });

      await rechargerEvaluations(formationId);

      setTitre("");
      setDescription("");
      setVisible(false);
    } catch (err) {
      console.error(err);

      setError("Impossible de créer l'évaluation.");
    } finally {
      setSaving(false);
    }
  }

  return {
    visible,
    titre,
    description,
    saving,
    error,
    setTitre,
    setDescription,
    toggle,
    annuler,
    submit,
  };
}

export type EvaluationFormState = ReturnType<typeof useEvaluationForm>;