import { useRef, useState, type FormEvent } from "react";

import {
  confirmerPaiement,
  initierPaiement,
  type MethodePaiement,
  type Paiement,
} from "../../services/paiement.service";
import { getErrorMessage } from "../../utils/errors";
import { formatPrix } from "../../utils/format";

const METHODES: {
  valeur: MethodePaiement;
  libelle: string;
  prefixes: string;
}[] = [
  { valeur: "MVOLA", libelle: "MVola", prefixes: "034 ou 038" },
  { valeur: "ORANGE_MONEY", libelle: "Orange Money", prefixes: "032 ou 037" },
  { valeur: "AIRTEL_MONEY", libelle: "Airtel Money", prefixes: "033" },
];

type Etape = "saisie" | "code" | "resultat";

type Props = {
  formation: {
    id: string;
    titre: string;
    prix: string;
  };
  onFermer: () => void;
  // Appelé à la fermeture si le paiement a réussi (pour recharger la liste)
  onTermine: () => void;
};

function nouvelleCle() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function PaiementModal({ formation, onFermer, onTermine }: Props) {
  const [etape, setEtape] = useState<Etape>("saisie");
  const [methode, setMethode] = useState<MethodePaiement>("MVOLA");
  const [telephone, setTelephone] = useState("");
  const [code, setCode] = useState("");
  const [paiement, setPaiement] = useState<Paiement | null>(null);
  const [codeSimulation, setCodeSimulation] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  // Même clé tant que l'utilisateur ne recommence pas : évite les doublons
  const cleIdempotence = useRef(nouvelleCle());

  const methodeChoisie = METHODES.find((item) => item.valeur === methode);

  function fermer() {
    if (paiement?.statut === "REUSSI") {
      onTermine();
    }

    onFermer();
  }

  function recommencer() {
    cleIdempotence.current = nouvelleCle();

    setEtape("saisie");
    setPaiement(null);
    setCodeSimulation(null);
    setCode("");
    setMessage("");
    setErreur("");
  }

  async function handleSaisie(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!telephone.trim()) {
      setErreur("Le numéro de téléphone est obligatoire.");

      return;
    }

    try {
      setLoading(true);
      setErreur("");

      const data = await initierPaiement(
        {
          formationId: formation.id,
          methode,
          telephone: telephone.trim(),
        },
        cleIdempotence.current
      );

      setPaiement(data.paiement);
      setMessage(data.message);
      setCodeSimulation(data.codeSimulation ?? null);
      setCode("");
      setEtape("code");
    } catch (err) {
      setErreur(getErrorMessage(err, "Impossible d'initier le paiement."));
    } finally {
      setLoading(false);
    }
  }

  async function handleCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!paiement) {
      return;
    }

    if (!code.trim()) {
      setErreur("Saisissez le code de confirmation.");

      return;
    }

    try {
      setLoading(true);
      setErreur("");

      const data = await confirmerPaiement(paiement.id, code.trim());

      setPaiement(data.paiement);
      setMessage(data.message);
      setEtape("resultat");
    } catch (err) {
      setErreur(getErrorMessage(err, "Impossible de confirmer le paiement."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
          Paiement
        </p>

        <h2 className="mt-2 text-xl font-bold text-slate-900">
          {formation.titre}
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          Montant à payer :{" "}
          <span className="font-semibold text-slate-900">
            {formatPrix(formation.prix)}
          </span>
        </p>

        {/* ÉTAPE 1 : MOYEN DE PAIEMENT ET NUMÉRO */}

        {etape === "saisie" && (
          <form onSubmit={handleSaisie} noValidate className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Moyen de paiement
              </label>

              <div className="grid grid-cols-3 gap-2">
                {METHODES.map((item) => (
                  <button
                    key={item.valeur}
                    type="button"
                    onClick={() => setMethode(item.valeur)}
                    className={`rounded-xl px-2 py-3 text-sm font-semibold transition ${
                      methode === item.valeur
                        ? "bg-slate-950 text-white"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item.libelle}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Numéro {methodeChoisie?.libelle}
              </label>

              <input
                type="tel"
                inputMode="tel"
                value={telephone}
                onChange={(event) => setTelephone(event.target.value)}
                placeholder="Exemple : 034 12 345 67"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
              />

              <p className="mt-1 text-xs text-slate-500">
                Numéros en {methodeChoisie?.prefixes}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
              Mode simulation : aucun argent réel n'est débité. Un numéro qui
              se termine par 00 simule un solde insuffisant.
            </div>

            {erreur && <p className="text-sm text-red-600">{erreur}</p>}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={fermer}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {loading ? "Envoi du code..." : "Continuer"}
              </button>
            </div>
          </form>
        )}

        {/* ÉTAPE 2 : CODE DE CONFIRMATION */}

        {etape === "code" && paiement && (
          <form onSubmit={handleCode} noValidate className="mt-6 space-y-5">
            <p className="text-sm text-slate-600">{message}</p>

            {codeSimulation && (
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <p>
                  Simulation, SMS reçu :{" "}
                  <span className="font-mono font-bold">{codeSimulation}</span>
                </p>

                <button
                  type="button"
                  onClick={() => setCode(codeSimulation)}
                  className="mt-2 text-xs font-semibold underline"
                >
                  Remplir le code
                </button>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Code de confirmation
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, ""))
                }
                placeholder="6 chiffres"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center font-mono text-lg tracking-widest outline-none focus:border-cyan-600"
              />
            </div>

            {erreur && <p className="text-sm text-red-600">{erreur}</p>}

            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={recommencer}
                className="text-sm font-semibold text-slate-500 underline"
              >
                Recommencer
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {loading ? "Vérification..." : `Payer ${formatPrix(formation.prix)}`}
              </button>
            </div>
          </form>
        )}

        {/* ÉTAPE 3 : RÉSULTAT */}

        {etape === "resultat" && paiement && (
          <div className="mt-6 space-y-5">
            {paiement.statut === "REUSSI" ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-semibold text-emerald-800">
                  Paiement réussi
                </p>

                <p className="mt-1 text-sm text-emerald-700">{message}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="font-semibold text-red-800">Paiement refusé</p>

                <p className="mt-1 text-sm text-red-700">{message}</p>
              </div>
            )}

            <p className="text-xs text-slate-500">
              Référence : <span className="font-mono">{paiement.reference}</span>
            </p>

            <div className="flex justify-end gap-3">
              {paiement.statut !== "REUSSI" && (
                <button
                  type="button"
                  onClick={recommencer}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Réessayer
                </button>
              )}

              <button
                type="button"
                onClick={fermer}
                className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
              >
                {paiement.statut === "REUSSI" ? "Terminer" : "Fermer"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaiementModal;