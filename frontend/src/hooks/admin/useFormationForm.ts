import { useState } from "react";

import type {
  FormationAdmin,
  TypeFormation,
} from "../../services/formation.service";
import { isValidPrix, onlyPrix } from "../../utils/validation";

export type FormationFormValues = {
  titre: string;
  description: string;
  prix: string;
  type: TypeFormation;
  niveau: string;
};

export type FormationFormErreurs = Record<string, string>;

const VALEURS_VIDES: FormationFormValues = {
  titre: "",
  description: "",
  prix: "",
  type: "PROFESSIONNELLE",
  niveau: "",
};

/**
 * Prépare les valeurs du formulaire de modification à partir d'une formation.
 */
export function valeursDepuisFormation(
  formation: FormationAdmin
): FormationFormValues {
  return {
    titre: formation.titre,
    description: formation.description ?? "",
    // Les anciennes formations ont 0 : on laisse vide pour forcer un vrai prix
    prix: Number(formation.prix) > 0 ? String(Number(formation.prix)) : "",
    type: formation.type,
    niveau: formation.niveau ?? "",
  };
}

export function useFormationForm(
  valeursInitiales: FormationFormValues = VALEURS_VIDES
) {
  const [valeurs, setValeurs] =
    useState<FormationFormValues>(valeursInitiales);
  const [erreurs, setErreurs] = useState<FormationFormErreurs>({});

  function setChamp<K extends keyof FormationFormValues>(
    champ: K,
    valeur: FormationFormValues[K]
  ) {
    setValeurs((prev) => {
      if (champ === "type") {
        // Changer de type remet le niveau à zéro
        return { ...prev, type: valeur as TypeFormation, niveau: "" };
      }

      if (champ === "prix") {
        return { ...prev, prix: onlyPrix(valeur as string) };
      }

      return { ...prev, [champ]: valeur };
    });

    setErreurs((prev) => ({
      ...prev,
      [champ === "type" ? "niveau" : champ]: "",
    }));
  }

  /**
   * Valide les champs. Retourne true si tout est correct.
   */
  function valider(): boolean {
    const nouvellesErreurs: FormationFormErreurs = {};

    if (valeurs.titre.trim().length < 3) {
      nouvellesErreurs.titre = "Au moins 3 caractères";
    }

    if (!isValidPrix(valeurs.prix)) {
      nouvellesErreurs.prix =
        "Prix obligatoire, supérieur à 0 (exemple : 50000)";
    }

    if (valeurs.type === "CONTINUE" && !valeurs.niveau) {
      nouvellesErreurs.niveau =
        "Le niveau est obligatoire pour une formation continue";
    }

    if (Object.keys(nouvellesErreurs).length > 0) {
      setErreurs(nouvellesErreurs);

      return false;
    }

    setErreurs({});

    return true;
  }

  function reset() {
    setValeurs(VALEURS_VIDES);
    setErreurs({});
  }

  return { valeurs, erreurs, setChamp, valider, reset };
}