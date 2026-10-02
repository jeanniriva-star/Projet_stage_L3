import {
  useEffect,
  useState,
} from "react";
import axios from "axios";
import {
  Link,
  useParams,
} from "react-router-dom";
import ExercicesSection from "../../components/ExercicesSection";

import {
  createRessource,
  deleteRessource,
  downloadRessource,
  getRessourcesCours,
  updateRessource,
  uploadRessourceFichier,
  type RessourceCours,
} from "../../services/ressource.service";

import {
  createEvaluationQCM,
  getEvaluationsFormation,
  type EvaluationFormateur,
} from "../../services/evaluation.service";

type ModeAjoutRessource =
  | "URL"
  | "FICHIER";

function CoursFormateurPage() {
  const { coursId } =
    useParams();

  const [
    titreCours,
    setTitreCours,
  ] = useState("");

  const [
    titreFormation,
    setTitreFormation,
  ] = useState("");

  const [
    formationId,
    setFormationId,
  ] = useState("");

  const [
    ressources,
    setRessources,
  ] = useState<
    RessourceCours[]
  >([]);

  const [
    evaluations,
    setEvaluations,
  ] = useState<
    EvaluationFormateur[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // ====================================================
  // AJOUT RESSOURCE
  // ====================================================

  const [
    showRessourceForm,
    setShowRessourceForm,
  ] = useState(false);

  const [
    modeAjout,
    setModeAjout,
  ] =
    useState<ModeAjoutRessource>(
      "URL"
    );

  const [
    nomRessource,
    setNomRessource,
  ] = useState("");

  const [
    typeRessource,
    setTypeRessource,
  ] =
    useState<
      "VIDEO" | "LIEN"
    >("VIDEO");

  const [
    urlRessource,
    setUrlRessource,
  ] = useState("");

  const [
    fichierRessource,
    setFichierRessource,
  ] =
    useState<File | null>(
      null
    );

  const [
    savingRessource,
    setSavingRessource,
  ] = useState(false);

  const [
    ressourceError,
    setRessourceError,
  ] = useState("");

  // ====================================================
  // MODIFICATION RESSOURCE
  // ====================================================

  const [
    editingRessourceId,
    setEditingRessourceId,
  ] =
    useState<string | null>(
      null
    );

  const [
    editNom,
    setEditNom,
  ] = useState("");

  const [
    editType,
    setEditType,
  ] =
    useState<
      "VIDEO" | "LIEN"
    >("VIDEO");

  const [
    editUrl,
    setEditUrl,
  ] = useState("");

  const [
    savingEdit,
    setSavingEdit,
  ] = useState(false);

  const [
    editError,
    setEditError,
  ] = useState("");

  // ====================================================
  // TELECHARGEMENT
  // ====================================================

  const [
    downloadingId,
    setDownloadingId,
  ] =
    useState<string | null>(
      null
    );

  // ====================================================
  // EVALUATION
  // ====================================================

  const [
    showEvaluationForm,
    setShowEvaluationForm,
  ] = useState(false);

  const [
    titreEvaluation,
    setTitreEvaluation,
  ] = useState("");

  const [
    descriptionEvaluation,
    setDescriptionEvaluation,
  ] = useState("");

  const [
    savingEvaluation,
    setSavingEvaluation,
  ] = useState(false);

  const [
    evaluationError,
    setEvaluationError,
  ] = useState("");

  const [
    showEvaluations,
    setShowEvaluations,
  ] = useState(true);

  const [
    showRessources,
    setShowRessources,
  ] = useState(true);

  // ====================================================
  // CHARGEMENT
  // ====================================================

  useEffect(() => {
    async function chargerCours() {
      if (!coursId) {
        setLoading(false);
        return;
      }

      try {
        const dataRessources =
          await getRessourcesCours(
            coursId
          );

        setTitreCours(
          dataRessources.cours
            .titre
        );

        setTitreFormation(
          dataRessources.cours
            .formation.titre
        );

        setFormationId(
          dataRessources.cours
            .formation.id
        );

        setRessources(
          dataRessources.ressources
        );

        const toutesLesEvaluations =
          await getEvaluationsFormation(
            dataRessources
              .cours
              .formation
              .id
          );

        setEvaluations(
          toutesLesEvaluations.filter(
            (evaluation) =>
              evaluation.cours
                .id === coursId
          )
        );
      } catch (err) {
        console.error(err);

        setError(
          "Impossible de charger les informations du cours."
        );
      } finally {
        setLoading(false);
      }
    }

    chargerCours();
  }, [coursId]);

  async function rechargerRessources() {
    if (!coursId) {
      return;
    }

    const data =
      await getRessourcesCours(
        coursId
      );

    setRessources(
      data.ressources
    );
  }

  // ====================================================
  // OUTILS RESSOURCES
  // ====================================================

  function estFichier(
    ressource: RessourceCours
  ) {
    return ressource.url.startsWith(
      "/uploads/ressources/"
    );
  }

  function resetFormRessource() {
    setNomRessource("");
    setUrlRessource("");
    setTypeRessource(
      "VIDEO"
    );
    setFichierRessource(
      null
    );
    setModeAjout("URL");
    setRessourceError("");
  }

  // ====================================================
  // AJOUT
  // ====================================================

  async function handleAjouterRessource(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!coursId) {
      return;
    }

    setRessourceError("");

    /*
     * VIDEO / LIEN
     */
    if (
      modeAjout === "URL"
    ) {
      if (
        !nomRessource.trim() ||
        !urlRessource.trim()
      ) {
        setRessourceError(
          "Le nom et l'URL sont obligatoires."
        );

        return;
      }

      try {
        setSavingRessource(
          true
        );

        await createRessource(
          coursId,
          {
            nom:
              nomRessource.trim(),

            type:
              typeRessource,

            url:
              urlRessource.trim(),
          }
        );

        await rechargerRessources();

        resetFormRessource();

        setShowRessourceForm(
          false
        );

        setShowRessources(
          true
        );
      } catch (err) {
        console.error(err);

        setRessourceError(
          "Impossible d'ajouter la ressource."
        );
      } finally {
        setSavingRessource(
          false
        );
      }

      return;
    }

    /*
     * FICHIER
     */
    if (!fichierRessource) {
      setRessourceError(
        "Veuillez sélectionner un fichier."
      );

      return;
    }

    const tailleMax =
      20 *
      1024 *
      1024;

    if (
      fichierRessource.size >
      tailleMax
    ) {
      setRessourceError(
        "Le fichier ne doit pas dépasser 20 Mo."
      );

      return;
    }

    const extensionAutorisee =
      /\.(pdf|doc|docx|ppt|pptx)$/i.test(
        fichierRessource.name
      );

    if (
      !extensionAutorisee
    ) {
      setRessourceError(
        "Seuls les fichiers PDF, Word et PowerPoint sont autorisés."
      );

      return;
    }

    try {
      setSavingRessource(
        true
      );

      await uploadRessourceFichier(
        coursId,
        fichierRessource,
        nomRessource.trim() ||
          undefined
      );

      await rechargerRessources();

      resetFormRessource();

      setShowRessourceForm(
        false
      );

      setShowRessources(
        true
      );
   } catch (err) {
  console.error(
    "Erreur upload :",
    err
  );

  if (
    axios.isAxiosError(err)
  ) {
    console.error(
      "Réponse backend :",
      err.response?.data
    );

    setRessourceError(
      err.response?.data?.message ??
        "Impossible d'importer le fichier."
    );
  } else {
    setRessourceError(
      "Impossible d'importer le fichier."
    );
  }
} finally {
      setSavingRessource(
        false
      );
    }
  }

  // ====================================================
  // MODIFICATION
  // ====================================================

  function commencerModification(
    ressource: RessourceCours
  ) {
    setEditingRessourceId(
      ressource.id
    );

    setEditNom(
      ressource.nom
    );

    if (
      !estFichier(
        ressource
      )
    ) {
      setEditType(
        ressource.type
          .toUpperCase() ===
          "LIEN"
          ? "LIEN"
          : "VIDEO"
      );

      setEditUrl(
        ressource.url
      );
    } else {
      setEditUrl("");
    }

    setEditError("");
  }

  async function handleModifierRessource(
    event: React.FormEvent<HTMLFormElement>,
    ressourceId: string
  ) {
    event.preventDefault();

    if (!coursId) {
      return;
    }

    const ressource =
      ressources.find(
        (item) =>
          item.id ===
          ressourceId
      );

    if (!ressource) {
      return;
    }

    if (
      !editNom.trim()
    ) {
      setEditError(
        "Le nom est obligatoire."
      );

      return;
    }

    const fichier =
      estFichier(
        ressource
      );

    if (
      !fichier &&
      !editUrl.trim()
    ) {
      setEditError(
        "L'URL est obligatoire."
      );

      return;
    }

    try {
      setSavingEdit(true);
      setEditError("");

      if (fichier) {
        /*
         * Pour un fichier importé,
         * on modifie uniquement
         * son nom.
         */
        await updateRessource(
          ressourceId,
          {
            nom:
              editNom.trim(),
          }
        );
      } else {
        await updateRessource(
          ressourceId,
          {
            nom:
              editNom.trim(),

            type:
              editType,

            url:
              editUrl.trim(),
          }
        );
      }

      await rechargerRessources();

      setEditingRessourceId(
        null
      );
    } catch (err) {
      console.error(err);

      setEditError(
        "Impossible de modifier la ressource."
      );
    } finally {
      setSavingEdit(false);
    }
  }

  // ====================================================
  // SUPPRESSION
  // ====================================================

  async function handleSupprimerRessource(
    ressourceId: string
  ) {
    if (!coursId) {
      return;
    }

    const confirmation =
      window.confirm(
        "Voulez-vous vraiment supprimer cette ressource ?"
      );

    if (!confirmation) {
      return;
    }

    try {
      await deleteRessource(
        ressourceId
      );

      await rechargerRessources();
    } catch (err) {
      console.error(err);

      window.alert(
        "Impossible de supprimer la ressource."
      );
    }
  }

  // ====================================================
  // TELECHARGEMENT
  // ====================================================

  async function handleTelecharger(
    ressource: RessourceCours
  ) {
    try {
      setDownloadingId(
        ressource.id
      );

      await downloadRessource(
        ressource.id,
        ressource.nom
      );
    } catch (err) {
      console.error(err);

      window.alert(
        "Impossible de télécharger cette ressource."
      );
    } finally {
      setDownloadingId(null);
    }
  }

  // ====================================================
  // EVALUATION
  // ====================================================

  async function handleCreerEvaluation(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !coursId ||
      !formationId
    ) {
      return;
    }

    if (
      !titreEvaluation.trim()
    ) {
      setEvaluationError(
        "Le titre de l'évaluation est obligatoire."
      );

      return;
    }

    try {
      setSavingEvaluation(
        true
      );

      setEvaluationError(
        ""
      );

      await createEvaluationQCM(
        coursId,
        {
          titre:
            titreEvaluation.trim(),

          description:
            descriptionEvaluation.trim() ||
            undefined,
        }
      );

      const toutesLesEvaluations =
        await getEvaluationsFormation(
          formationId
        );

      setEvaluations(
        toutesLesEvaluations.filter(
          (evaluation) =>
            evaluation.cours
              .id === coursId
        )
      );

      setTitreEvaluation("");
      setDescriptionEvaluation("");

      setShowEvaluationForm(
        false
      );
    } catch (err) {
      console.error(err);

      setEvaluationError(
        "Impossible de créer l'évaluation."
      );
    } finally {
      setSavingEvaluation(
        false
      );
    }
  }

  // ====================================================
  // AFFICHAGE
  // ====================================================

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Chargement du cours...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <Link
          to={`/formateur/formations/${formationId}`}
          className="text-sm font-semibold text-cyan-700 hover:text-cyan-900"
        >
          ← Retour à la
          formation
        </Link>

        <header className="mt-6 border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            {titreFormation}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {titreCours}
          </h1>

          <p className="mt-2 text-slate-600">
            Gérez les ressources et
            les évaluations de ce
            cours.
          </p>

          <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-500">
            <span>
              {ressources.length}{" "}
              ressource
              {ressources.length >
              1
                ? "s"
                : ""}
            </span>

            <span>
              {evaluations.length}{" "}
              évaluation
              {evaluations.length >
              1
                ? "s"
                : ""}
            </span>
          </div>
        </header>

        {/* =================================================
            RESSOURCES
        ================================================= */}

        <section className="mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Ressources
                pédagogiques
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Documents, vidéos et
                liens associés à ce
                cours.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowRessources(
                    (current) =>
                      !current
                  )
                }
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {showRessources
                  ? "Masquer les ressources"
                  : "Afficher les ressources"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowRessourceForm(
                    (current) =>
                      !current
                  );

                  setRessourceError(
                    ""
                  );
                }}
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                {showRessourceForm
                  ? "Fermer"
                  : "Ajouter une ressource"}
              </button>
            </div>
          </div>

          {/* FORMULAIRE AJOUT */}

          {showRessourceForm && (
            <form
              onSubmit={
                handleAjouterRessource
              }
              className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-bold text-slate-900">
                Nouvelle ressource
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Ajoutez un document,
                une vidéo ou un lien.
              </p>

              {/* CHOIX MODE */}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setModeAjout(
                      "URL"
                    );

                    setRessourceError(
                      ""
                    );
                  }}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    modeAjout ===
                    "URL"
                      ? "bg-slate-950 text-white"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Vidéo / lien
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModeAjout(
                      "FICHIER"
                    );

                    setRessourceError(
                      ""
                    );
                  }}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    modeAjout ===
                    "FICHIER"
                      ? "bg-slate-950 text-white"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Importer un
                  document
                </button>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nom de la
                  ressource
                  {modeAjout ===
                    "FICHIER" && (
                    <span className="ml-1 font-normal text-slate-400">
                      (optionnel)
                    </span>
                  )}
                </label>

                <input
                  type="text"
                  value={
                    nomRessource
                  }
                  onChange={(
                    event
                  ) =>
                    setNomRessource(
                      event.target
                        .value
                    )
                  }
                  placeholder={
                    modeAjout ===
                    "FICHIER"
                      ? "Laisser vide pour utiliser le nom du fichier"
                      : "Ex : Introduction à React"
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-600"
                />
              </div>

              {modeAjout ===
              "URL" ? (
                <>
                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Type
                    </label>

                    <select
                      value={
                        typeRessource
                      }
                      onChange={(
                        event
                      ) =>
                        setTypeRessource(
                          event.target
                            .value as
                            | "VIDEO"
                            | "LIEN"
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-cyan-600"
                    >
                      <option value="VIDEO">
                        Vidéo
                      </option>

                      <option value="LIEN">
                        Lien externe
                      </option>
                    </select>
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      URL
                    </label>

                    <input
                      type="url"
                      value={
                        urlRessource
                      }
                      onChange={(
                        event
                      ) =>
                        setUrlRessource(
                          event.target
                            .value
                        )
                      }
                      placeholder={
                        typeRessource ===
                        "VIDEO"
                          ? "https://www.youtube.com/..."
                          : "https://..."
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-600"
                    />
                  </div>
                </>
              ) : (
                <div className="mt-5">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Fichier
                  </label>

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={(
                      event
                    ) =>
                      setFichierRessource(
                        event.target
                          .files?.[0] ??
                          null
                      )
                    }
                    className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    PDF, Word ou
                    PowerPoint — 20 Mo
                    maximum.
                  </p>

                  {fichierRessource && (
                    <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      Fichier
                      sélectionné :{" "}
                      <span className="font-semibold">
                        {
                          fichierRessource.name
                        }
                      </span>
                    </div>
                  )}
                </div>
              )}

              {ressourceError && (
                <p className="mt-4 text-sm text-red-600">
                  {
                    ressourceError
                  }
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetFormRessource();

                    setShowRessourceForm(
                      false
                    );
                  }}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={
                    savingRessource
                  }
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingRessource
                    ? modeAjout ===
                      "FICHIER"
                      ? "Importation..."
                      : "Ajout..."
                    : modeAjout ===
                      "FICHIER"
                    ? "Importer le fichier"
                    : "Ajouter la ressource"}
                </button>
              </div>
            </form>
          )}

          {/* LISTE */}

          {showRessources && (
            <>
              {ressources.length ===
              0 ? (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8">
                  <p className="text-sm text-slate-600">
                    Aucune ressource
                    ajoutée pour ce
                    cours.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {ressources.map(
                    (
                      ressource
                    ) => {
                      const fichier =
                        estFichier(
                          ressource
                        );

                      return (
                        <article
                          key={
                            ressource.id
                          }
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                                {
                                  ressource.type
                                }
                              </p>

                              <h3 className="mt-2 font-bold text-slate-900">
                                {
                                  ressource.nom
                                }
                              </h3>

                              <p className="mt-1 text-xs text-slate-500">
                                Ajouté
                                le{" "}
                                {new Date(
                                  ressource.createdAt
                                ).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              {fichier ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleTelecharger(
                                      ressource
                                    )
                                  }
                                  disabled={
                                    downloadingId ===
                                    ressource.id
                                  }
                                  className="rounded-xl border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:opacity-50"
                                >
                                  {downloadingId ===
                                  ressource.id
                                    ? "Téléchargement..."
                                    : "Télécharger"}
                                </button>
                              ) : (
                                <a
                                  href={
                                    ressource.url
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                  Ouvrir
                                </a>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  commencerModification(
                                    ressource
                                  )
                                }
                                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                              >
                                Modifier
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleSupprimerRessource(
                                    ressource.id
                                  )
                                }
                                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>

                          {/* MODIFICATION */}

                          {editingRessourceId ===
                            ressource.id && (
                            <form
                              onSubmit={(
                                event
                              ) =>
                                handleModifierRessource(
                                  event,
                                  ressource.id
                                )
                              }
                              className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5"
                            >
                              <h4 className="font-semibold text-slate-900">
                                Modifier
                                la
                                ressource
                              </h4>

                              <div className="mt-5">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                  Nom
                                </label>

                                <input
                                  type="text"
                                  value={
                                    editNom
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    setEditNom(
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-cyan-600"
                                />
                              </div>

                              {!fichier && (
                                <>
                                  <div className="mt-4">
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                      Type
                                    </label>

                                    <select
                                      value={
                                        editType
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        setEditType(
                                          event
                                            .target
                                            .value as
                                            | "VIDEO"
                                            | "LIEN"
                                        )
                                      }
                                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                                    >
                                      <option value="VIDEO">
                                        Vidéo
                                      </option>

                                      <option value="LIEN">
                                        Lien
                                        externe
                                      </option>
                                    </select>
                                  </div>

                                  <div className="mt-4">
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                      URL
                                    </label>

                                    <input
                                      type="url"
                                      value={
                                        editUrl
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        setEditUrl(
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                                    />
                                  </div>
                                </>
                              )}

                              {fichier && (
                                <p className="mt-3 text-xs text-slate-500">
                                  Pour
                                  remplacer
                                  le fichier,
                                  supprimez
                                  cette
                                  ressource
                                  puis
                                  importez-en
                                  une
                                  nouvelle.
                                </p>
                              )}

                              {editError && (
                                <p className="mt-4 text-sm text-red-600">
                                  {
                                    editError
                                  }
                                </p>
                              )}

                              <div className="mt-5 flex justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingRessourceId(
                                      null
                                    );

                                    setEditError(
                                      ""
                                    );
                                  }}
                                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                                >
                                  Annuler
                                </button>

                                <button
                                  type="submit"
                                  disabled={
                                    savingEdit
                                  }
                                  className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                >
                                  {savingEdit
                                    ? "Enregistrement..."
                                    : "Enregistrer"}
                                </button>
                              </div>
                            </form>
                          )}
                        </article>
                      );
                    }
                  )}
                </div>
              )}
            </>
          )}
        </section>

        {/* =================================================
            EVALUATIONS
        ================================================= */}

        <section className="mt-12 border-t border-slate-200 pt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Évaluations
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                QCM et autres
                évaluations associées
                au cours.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowEvaluations(
                    (current) =>
                      !current
                  )
                }
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                {showEvaluations
                  ? "Masquer les QCM"
                  : "Afficher les QCM"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowEvaluationForm(
                    (current) =>
                      !current
                  )
                }
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                {showEvaluationForm
                  ? "Fermer"
                  : "Créer une évaluation"}
              </button>
            </div>
          </div>

          {showEvaluationForm && (
            <form
              onSubmit={
                handleCreerEvaluation
              }
              className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                QCM
              </p>

              <h3 className="mt-2 text-lg font-bold text-slate-900">
                Nouvelle
                évaluation
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Créez d'abord le QCM.
                Les questions seront
                ajoutées ensuite.
              </p>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Titre
                </label>

                <input
                  type="text"
                  value={
                    titreEvaluation
                  }
                  onChange={(
                    event
                  ) =>
                    setTitreEvaluation(
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  value={
                    descriptionEvaluation
                  }
                  onChange={(
                    event
                  ) =>
                    setDescriptionEvaluation(
                      event.target
                        .value
                    )
                  }
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              {evaluationError && (
                <p className="mt-4 text-sm text-red-600">
                  {
                    evaluationError
                  }
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setShowEvaluationForm(
                      false
                    )
                  }
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={
                    savingEvaluation
                  }
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {savingEvaluation
                    ? "Création..."
                    : "Créer le QCM"}
                </button>
              </div>
            </form>
          )}

          {showEvaluations && (
            <>
              {evaluations.length ===
              0 ? (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8">
                  <p className="text-sm text-slate-600">
                    Aucune évaluation
                    créée pour ce
                    cours.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {evaluations.map(
                    (
                      evaluation
                    ) => (
                      <article
                        key={
                          evaluation.id
                        }
                        className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                            {
                              evaluation.type
                            }
                          </p>

                          <h3 className="mt-2 text-lg font-bold text-slate-900">
                            {
                              evaluation.titre
                            }
                          </h3>

                          {evaluation.description && (
                            <p className="mt-2 max-w-2xl text-sm text-slate-600">
                              {
                                evaluation.description
                              }
                            </p>
                          )}

                          {evaluation._count && (
                            <div className="mt-3 flex flex-wrap gap-5 text-sm text-slate-500">
                              <span>
                                {
                                  evaluation
                                    ._count
                                    .questions
                                }{" "}
                                question
                                {evaluation
                                  ._count
                                  .questions >
                                1
                                  ? "s"
                                  : ""}
                              </span>

                              <span>
                                {
                                  evaluation
                                    ._count
                                    .soumissions
                                }{" "}
                                soumission
                                {evaluation
                                  ._count
                                  .soumissions >
                                1
                                  ? "s"
                                  : ""}
                              </span>
                            </div>
                          )}
                        </div>

                        <Link
                          to={`/formateur/evaluations/${evaluation.id}`}
                          className="shrink-0 rounded-xl border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Gérer
                          l'évaluation
                        </Link>
                      </article>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </section>
        {coursId && <ExercicesSection coursId={coursId} isFormateur />}
      </div>
    </div>

    

  );
}

export default CoursFormateurPage;