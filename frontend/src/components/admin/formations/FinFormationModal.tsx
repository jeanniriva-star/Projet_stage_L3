import { useEffect, useState } from "react";

import {
  getApercuFinFormation,
  terminerFormationAdmin,
  type ApercuFinFormation,
  type ResultatApprenantFin,
  type ResultatFinFormation,
} from "../../../services/formation.service";
import { getErrorMessage } from "../../../utils/errors";

interface FinFormationModalProps {
  formationId: string;
  titre: string;
  onFermer: () => void;
  onTermine: (resultat: ResultatFinFormation) => void;
}

function pluriel(nombre: number, mot: string) {
  return `${nombre} ${mot}${nombre > 1 ? "s" : ""}`;
}

function ListeApprenants({
  resultats,
  couleur,
}: {
  resultats: ResultatApprenantFin[];
  couleur: "vert" | "gris";
}) {
  const classes =
    couleur === "vert"
      ? "divide-emerald-100 border-emerald-200 bg-emerald-50"
      : "divide-slate-200 border-slate-200 bg-slate-50";

  return (
    <ul
      className={`mt-2 max-h-48 divide-y overflow-y-auto rounded-xl border ${classes}`}
    >
      {resultats.map((resultat) => (
        <li
          key={resultat.inscriptionId}
          className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
        >
          <span className="min-w-0 truncate text-slate-800">
            {resultat.apprenant.prenom} {resultat.apprenant.nom}
          </span>

          <span className="shrink-0 font-semibold text-slate-900">
            {resultat.moyenne === null
              ? "Aucun QCM"
              : `${resultat.moyenne}/20`}
          </span>
        </li>
      ))}
    </ul>
  );
}

function FinFormationModal({
  formationId,
  titre,
  onFermer,
  onTermine,
}: FinFormationModalProps) {
  const [apercu, setApercu] = useState<ApercuFinFormation | null>(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let annule = false;

    async function charger() {
      try {
        const data = await getApercuFinFormation(formationId);

        if (!annule) {
          setApercu(data);
        }
      } catch (err: unknown) {
        if (annule) {
          return;
        }

        console.error("Erreur aperçu fin de formation :", err);
        setError(
          getErrorMessage(
            err,
            "Impossible de calculer les résultats de la formation."
          )
        );
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
  }, [formationId]);

  async function handleConfirmer() {
    try {
      setEnding(true);
      setError("");

      const resultat = await terminerFormationAdmin(formationId);

      onTermine(resultat);
    } catch (err: unknown) {
      console.error("Erreur fin de formation :", err);
      setError(
        getErrorMessage(err, "Impossible de terminer la formation.")
      );
    } finally {
      setEnding(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900">
          Mettre fin à la formation
        </h2>

        <p className="mt-1 text-sm text-slate-500">{titre}</p>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Cette action est définitive : les inscriptions, les paiements et
          les QCM de cette formation seront fermés, et un certificat sera
          délivré aux apprenants qui atteignent le seuil de réussite.
        </div>

        {loading && (
          <p className="mt-6 text-sm text-slate-500">
            Calcul des résultats...
          </p>
        )}

        {apercu && (
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-semibold text-emerald-700">
                {pluriel(apercu.eligibles.length, "apprenant")}{" "}
                {apercu.eligibles.length > 1 ? "obtiennent" : "obtient"} un
                certificat
              </h3>

              <p className="text-xs text-slate-500">
                Moyenne des QCM de {apercu.seuil}/20 ou plus (70 %).
              </p>

              {apercu.eligibles.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  Aucun apprenant n'atteint le seuil pour le moment.
                </p>
              ) : (
                <ListeApprenants
                  resultats={apercu.eligibles}
                  couleur="vert"
                />
              )}
            </div>

            <div>
              <h3 className="font-semibold text-slate-800">
                {pluriel(apercu.nonEligibles.length, "apprenant")} sans
                certificat
              </h3>

              {apercu.nonEligibles.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  Tous les apprenants atteignent le seuil.
                </p>
              ) : (
                <ListeApprenants
                  resultats={apercu.nonEligibles}
                  couleur="gris"
                />
              )}
            </div>

            <p className="text-xs text-slate-500">
              Seuls les apprenants dont l'inscription est validée sont
              comptés.
            </p>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onFermer}
            disabled={ending}
            className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleConfirmer}
            disabled={loading || ending || !apercu}
            className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {ending ? "Traitement..." : "Confirmer la fin de la formation"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FinFormationModal;