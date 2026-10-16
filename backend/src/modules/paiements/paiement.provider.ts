import { createHmac, randomUUID } from "node:crypto";

import type { MethodePaiement } from "../../generated/prisma/enums.js";

// ======================================================
// FOURNISSEUR DE PAIEMENT SIMULÉ
// ======================================================
// Ce fichier joue le rôle de MVola, Orange Money ou Airtel Money.
// Pour passer à une vraie API, il suffira de remplacer le contenu
// de initierTransaction et confirmerTransaction en gardant
// les mêmes entrées et sorties.

const SECRET =
  process.env.PAIEMENT_SIMULATION_SECRET ?? "secret-simulation-dev";

// En développement, le code "reçu par SMS" est aussi renvoyé à l'interface
// et affiché dans la console du serveur.
const SIMULATION_VISIBLE = process.env.NODE_ENV !== "production";

const LIBELLES: Record<MethodePaiement, string> = {
  MVOLA: "MVola",
  ORANGE_MONEY: "Orange Money",
  AIRTEL_MONEY: "Airtel Money",
};

// Préfixes de numéros par opérateur
const PREFIXES: Record<MethodePaiement, string[]> = {
  MVOLA: ["034", "038"],
  ORANGE_MONEY: ["032", "037"],
  AIRTEL_MONEY: ["033"],
};

// ======================================================
// OUTILS
// ======================================================

function attendre(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simule le temps de réponse d'une vraie API (300 à 800 ms)
function latence() {
  return attendre(300 + Math.floor(Math.random() * 500));
}

/**
 * Normalise un numéro : retire les espaces et gère le format +261.
 * Exemple : "+261 34 12 345 67" devient "0341234567".
 */
export function normaliserTelephone(telephone: string): string {
  let chiffres = telephone.replace(/[^\d+]/g, "");

  if (chiffres.startsWith("+261")) {
    chiffres = "0" + chiffres.slice(4);
  } else if (chiffres.startsWith("261") && chiffres.length === 12) {
    chiffres = "0" + chiffres.slice(3);
  }

  return chiffres;
}

// Le code de confirmation est calculé à partir de l'identifiant de transaction
function genererCode(transactionId: string): string {
  const hmac = createHmac("sha256", SECRET).update(transactionId).digest();

  const nombre = hmac.readUInt32BE(0) % 1_000_000;

  return String(nombre).padStart(6, "0");
}

// ======================================================
// INITIER UNE TRANSACTION
// ======================================================

interface InitierTransactionParams {
  reference: string;
  montant: number;
  devise: string;
  methode: MethodePaiement;
  telephone: string;
}

interface InitierTransactionResultat {
  transactionId: string;
  message: string;
  // Présent seulement en développement (simule le SMS reçu)
  codeSimulation?: string;
}

export async function initierTransaction(
  params: InitierTransactionParams
): Promise<InitierTransactionResultat> {
  await latence();

  const telephone = normaliserTelephone(params.telephone);

  if (!/^03\d{8}$/.test(telephone)) {
    throw new Error(
      "Numéro invalide : il doit contenir 10 chiffres et commencer par 03"
    );
  }

  const prefixe = telephone.slice(0, 3);

  if (!PREFIXES[params.methode].includes(prefixe)) {
    throw new Error(
      `Ce numéro ne correspond pas à ${LIBELLES[params.methode]} (numéros en ${PREFIXES[
        params.methode
      ].join(" ou ")})`
    );
  }

  if (params.montant <= 0) {
    throw new Error("Montant invalide");
  }

  const transactionId = `SIM-${randomUUID()}`;

  const code = genererCode(transactionId);

  if (SIMULATION_VISIBLE) {
    console.log(
      `[SIMULATEUR ${LIBELLES[params.methode]}] Code de confirmation pour ${telephone} : ${code}`
    );
  }

  return {
    transactionId,
    message: `Un code de confirmation a été envoyé au ${telephone}`,
    ...(SIMULATION_VISIBLE && { codeSimulation: code }),
  };
}

// ======================================================
// CONFIRMER UNE TRANSACTION
// ======================================================

interface ConfirmerTransactionParams {
  transactionId: string;
  methode: MethodePaiement;
  telephone: string;
  code: string;
}

export type ResultatConfirmation =
  | { statut: "REUSSI" }
  | { statut: "ECHOUE"; motif: string }
  | { statut: "CODE_INVALIDE" };

export async function confirmerTransaction(
  params: ConfirmerTransactionParams
): Promise<ResultatConfirmation> {
  await latence();

  if (params.code.trim() !== genererCode(params.transactionId)) {
    return { statut: "CODE_INVALIDE" };
  }

  // Numéros de test : les deux derniers chiffres décident du scénario
  const telephone = normaliserTelephone(params.telephone);

  const fin = telephone.slice(-2);

  if (fin === "00") {
    return { statut: "ECHOUE", motif: "Solde insuffisant" };
  }

  if (fin === "01") {
    return { statut: "ECHOUE", motif: "Compte suspendu" };
  }

  return { statut: "REUSSI" };
}