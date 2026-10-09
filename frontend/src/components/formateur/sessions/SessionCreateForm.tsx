import { useState, type FormEvent } from "react";

import ErrorAlert from "../../common/ErrorAlert";
import type { FormationAffectee } from "../../../services/affectation.service";
import type { CreateSessionData } from "../../../types/session.types";

interface SessionCreateFormProps {
  formations: FormationAffectee[];
  creating: boolean;
  createError: string;
  onSubmit: (formationId: string, data: CreateSessionData) => void;
}

const inputClass =
  "w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

function SessionCreateForm({
  formations,
  creating,
  createError,
  onSubmit,
}: SessionCreateFormProps) {
  const [formationId, setFormationId] = useState("");
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [erreurLocale, setErreurLocale] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErreurLocale("");

    if (!formationId || !titre.trim() || !dateDebut || !dateFin) {
      setErreurLocale("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (new Date(dateFin) <= new Date(dateDebut)) {
      setErreurLocale("La date de fin doit être après la date de début.");
      return;
    }

    onSubmit(formationId, {
      titre: titre.trim(),
      description: description.trim() || undefined,
      dateDebut: new Date(dateDebut).toISOString(),
      dateFin: new Date(dateFin).toISOString(),
    });
  }

  const message = erreurLocale || createError;

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Nouvelle session</h2>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className={labelClass}>Formation</label>

          <select
            value={formationId}
            onChange={(event) => setFormationId(event.target.value)}
            className={inputClass}
          >
            <option value="">Sélectionner une formation</option>

            {formations.map((affectation) => (
              <option
                key={affectation.formation.id}
                value={affectation.formation.id}
              >
                {affectation.formation.titre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Titre</label>

          <input
            type="text"
            value={titre}
            onChange={(event) => setTitre(event.target.value)}
            className={inputClass}
            placeholder="Ex. Session React - Hooks"
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className={inputClass}
            placeholder="Description de la session"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Début</label>

            <input
              type="datetime-local"
              value={dateDebut}
              onChange={(event) => setDateDebut(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Fin</label>

            <input
              type="datetime-local"
              value={dateFin}
              onChange={(event) => setDateFin(event.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {message && <ErrorAlert message={message} />}

        <button
          type="submit"
          disabled={creating}
          className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? "Création..." : "Créer la session"}
        </button>
      </form>
    </section>
  );
}

export default SessionCreateForm;