import { useState, type FormEvent } from "react";
import axios from "axios";

import {
  createRessource,
  deleteRessource,
  downloadRessource,
  updateRessource,
  uploadRessourceFichier,
  type RessourceCours,
} from "../services/ressource.service";

import type {
  ModeAjoutRessource,
  TypeRessourceUrl,
} from "../types/ressource-form.types";

import { estFichier, validerFichierRessource } from "../utils/ressource.utils";

export function useRessourcesFormateur(
  coursId: string | undefined,
  ressources: RessourceCours[],
  rechargerRessources: () => Promise<void>
) {
  // ====================================================
  // AFFICHAGE DE LA LISTE
  // ====================================================

  const [showRessources, setShowRessources] = useState(true);

  // ====================================================
  // AJOUT
  // ====================================================

  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<ModeAjoutRessource>("URL");
  const [nomAjout, setNomAjout] = useState("");
  const [typeAjout, setTypeAjout] = useState<TypeRessourceUrl>("VIDEO");
  const [urlAjout, setUrlAjout] = useState("");
  const [fichierAjout, setFichierAjout] = useState<File | null>(null);
  const [savingAjout, setSavingAjout] = useState(false);
  const [errorAjout, setErrorAjout] = useState("");

  function resetFormAjout() {
    setNomAjout("");
    setUrlAjout("");
    setTypeAjout("VIDEO");
    setFichierAjout(null);
    setMode("URL");
    setErrorAjout("");
  }

  function toggleFormAjout() {
    setShowForm((current) => !current);
    setErrorAjout("");
  }

  function changerMode(nouveauMode: ModeAjoutRessource) {
    setMode(nouveauMode);
    setErrorAjout("");
  }

  function annulerAjout() {
    resetFormAjout();
    setShowForm(false);
  }

  async function apresAjoutReussi() {
    await rechargerRessources();

    resetFormAjout();
    setShowForm(false);
    setShowRessources(true);
  }

  async function submitAjout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!coursId) {
      return;
    }

    setErrorAjout("");

    // VIDEO / LIEN
    if (mode === "URL") {
      if (!nomAjout.trim() || !urlAjout.trim()) {
        setErrorAjout("Le nom et l'URL sont obligatoires.");

        return;
      }

      try {
        setSavingAjout(true);

        await createRessource(coursId, {
          nom: nomAjout.trim(),
          type: typeAjout,
          url: urlAjout.trim(),
        });

        await apresAjoutReussi();
      } catch (err) {
        console.error(err);

        setErrorAjout("Impossible d'ajouter la ressource.");
      } finally {
        setSavingAjout(false);
      }

      return;
    }

    // FICHIER
    if (!fichierAjout) {
      setErrorAjout("Veuillez sélectionner un fichier.");

      return;
    }

    const erreurFichier = validerFichierRessource(fichierAjout);

    if (erreurFichier) {
      setErrorAjout(erreurFichier);

      return;
    }

    try {
      setSavingAjout(true);

      await uploadRessourceFichier(
        coursId,
        fichierAjout,
        nomAjout.trim() || undefined
      );

      await apresAjoutReussi();
    } catch (err) {
      console.error("Erreur upload :", err);

      if (axios.isAxiosError(err)) {
        console.error("Réponse backend :", err.response?.data);

        setErrorAjout(
          err.response?.data?.message ?? "Impossible d'importer le fichier."
        );
      } else {
        setErrorAjout("Impossible d'importer le fichier.");
      }
    } finally {
      setSavingAjout(false);
    }
  }

  // ====================================================
  // MODIFICATION
  // ====================================================

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNom, setEditNom] = useState("");
  const [editType, setEditType] = useState<TypeRessourceUrl>("VIDEO");
  const [editUrl, setEditUrl] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  function commencerModification(ressource: RessourceCours) {
    setEditingId(ressource.id);
    setEditNom(ressource.nom);

    if (!estFichier(ressource)) {
      setEditType(ressource.type.toUpperCase() === "LIEN" ? "LIEN" : "VIDEO");
      setEditUrl(ressource.url);
    } else {
      setEditUrl("");
    }

    setEditError("");
  }

  function annulerModification() {
    setEditingId(null);
    setEditError("");
  }

  async function submitModification(
    event: FormEvent<HTMLFormElement>,
    ressourceId: string
  ) {
    event.preventDefault();

    if (!coursId) {
      return;
    }

    const ressource = ressources.find((item) => item.id === ressourceId);

    if (!ressource) {
      return;
    }

    if (!editNom.trim()) {
      setEditError("Le nom est obligatoire.");

      return;
    }

    const fichier = estFichier(ressource);

    if (!fichier && !editUrl.trim()) {
      setEditError("L'URL est obligatoire.");

      return;
    }

    try {
      setSavingEdit(true);
      setEditError("");

      if (fichier) {
        // Pour un fichier importé, on modifie uniquement son nom.
        await updateRessource(ressourceId, {
          nom: editNom.trim(),
        });
      } else {
        await updateRessource(ressourceId, {
          nom: editNom.trim(),
          type: editType,
          url: editUrl.trim(),
        });
      }

      await rechargerRessources();

      setEditingId(null);
    } catch (err) {
      console.error(err);

      setEditError("Impossible de modifier la ressource.");
    } finally {
      setSavingEdit(false);
    }
  }

  // ====================================================
  // SUPPRESSION
  // ====================================================

  async function supprimer(ressourceId: string) {
    if (!coursId) {
      return;
    }

    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer cette ressource ?"
    );

    if (!confirmation) {
      return;
    }

    try {
      await deleteRessource(ressourceId);

      await rechargerRessources();
    } catch (err) {
      console.error(err);

      window.alert("Impossible de supprimer la ressource.");
    }
  }

  // ====================================================
  // TELECHARGEMENT
  // ====================================================

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function telecharger(ressource: RessourceCours) {
    try {
      setDownloadingId(ressource.id);

      await downloadRessource(ressource.id, ressource.nom);
    } catch (err) {
      console.error(err);

      window.alert("Impossible de télécharger cette ressource.");
    } finally {
      setDownloadingId(null);
    }
  }

  return {
    showRessources,
    toggleRessources: () => setShowRessources((current) => !current),
    downloadingId,
    supprimer,
    telecharger,

    ajout: {
      visible: showForm,
      mode,
      nom: nomAjout,
      type: typeAjout,
      url: urlAjout,
      fichier: fichierAjout,
      saving: savingAjout,
      error: errorAjout,
      setNom: setNomAjout,
      setType: setTypeAjout,
      setUrl: setUrlAjout,
      setFichier: setFichierAjout,
      changerMode,
      toggle: toggleFormAjout,
      annuler: annulerAjout,
      submit: submitAjout,
    },

    edition: {
      editingId,
      nom: editNom,
      type: editType,
      url: editUrl,
      saving: savingEdit,
      error: editError,
      setNom: setEditNom,
      setType: setEditType,
      setUrl: setEditUrl,
      commencer: commencerModification,
      annuler: annulerModification,
      submit: submitModification,
    },
  };
}

export type RessourceAjout = ReturnType<typeof useRessourcesFormateur>["ajout"];

export type RessourceEdition = ReturnType<
  typeof useRessourcesFormateur
>["edition"];