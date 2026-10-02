import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import axios from "axios";

import {
  checkUserDeletionAdmin,
  createUserAdmin,
  deleteUserAdmin,
  getUsersAdmin,
  type DeleteCheckAdmin,
  type DeleteCheckApprenant,
  type DeleteCheckFormateur,
  type DeleteCheckResponse,
  type UserAdmin,
  type UserRole,
} from "../../services/user.service";

function isDeleteCheckApprenant(
  data: DeleteCheckResponse
): data is DeleteCheckApprenant {
  return data.user.role === "APPRENANT";
}

function isDeleteCheckFormateur(
  data: DeleteCheckResponse
): data is DeleteCheckFormateur {
  return data.user.role === "FORMATEUR";
}

function isDeleteCheckAdmin(
  data: DeleteCheckResponse
): data is DeleteCheckAdmin {
  return data.user.role === "ADMIN";
}

function UtilisateursAdminPage() {
  // =====================================================
  // LISTE DES UTILISATEURS
  // =====================================================

  const [utilisateurs, setUtilisateurs] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // RECHERCHE / FILTRES
  // =====================================================

  const [recherche, setRecherche] = useState("");
  const [roleFiltre, setRoleFiltre] = useState("");

  // =====================================================
  // PAGINATION
  // =====================================================

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // =====================================================
  // CRÉATION UTILISATEUR
  // =====================================================

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [
  deleting,
  setDeleting,
] = useState(false);

  const [roleCreation, setRoleCreation] = useState<
    "ADMIN" | "FORMATEUR"
  >("FORMATEUR");

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [
  verificationData,
  setVerificationData,
] = useState<DeleteCheckResponse | null>(null);

const [
  loadingVerification,
  setLoadingVerification,
] = useState(false);

const [
  showVerificationDetails,
  setShowVerificationDetails,
] = useState(false);

  // =====================================================
  // SUPPRESSION
  // =====================================================

  const [
    utilisateurASupprimer,
    setUtilisateurASupprimer,
  ] = useState<UserAdmin | null>(null);

  const [
    showWarningSuppression,
    setShowWarningSuppression,
  ] = useState(false);

  const [
    showConfirmationSuppression,
    setShowConfirmationSuppression,
  ] = useState(false);

  // =====================================================
  // CHARGEMENT
  // =====================================================

  async function chargerUtilisateurs(
    pageDemandee = page,
    rechercheDemandee = recherche,
    roleDemande = roleFiltre
  ) {
    try {
      setLoading(true);
      setError("");

      const data = await getUsersAdmin(
        pageDemandee,
        10,
        rechercheDemandee,
        roleDemande
      );

      setUtilisateurs(data.utilisateurs);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err: unknown) {
      console.error(
        "Erreur utilisateurs admin :",
        err
      );

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "Impossible de charger les utilisateurs."
        );
      } else {
        setError(
          "Impossible de charger les utilisateurs."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // CHARGEMENT INITIAL
  // =====================================================

  useEffect(() => {
    let annule = false;

    async function initialiser() {
      try {
        const data = await getUsersAdmin(
          1,
          10,
          "",
          ""
        );

        if (annule) {
          return;
        }

        setUtilisateurs(data.utilisateurs);
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      } catch (err: unknown) {
        if (annule) {
          return;
        }

        console.error(
          "Erreur utilisateurs admin :",
          err
        );

        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message ??
              "Impossible de charger les utilisateurs."
          );
        } else {
          setError(
            "Impossible de charger les utilisateurs."
          );
        }
      } finally {
        if (!annule) {
          setLoading(false);
        }
      }
    }

    initialiser();

    return () => {
      annule = true;
    };
  }, []);

  // =====================================================
  // RECHERCHE
  // =====================================================

  async function handleRecherche(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await chargerUtilisateurs(
      1,
      recherche,
      roleFiltre
    );
  }

  // =====================================================
  // FILTRE RÔLE
  // =====================================================

  async function handleRoleFilter(
    role: string
  ) {
    setRoleFiltre(role);

    await chargerUtilisateurs(
      1,
      recherche,
      role
    );
  }

  // =====================================================
  // RESET CRÉATION
  // =====================================================

  function resetCreation() {
    setNom("");
    setPrenom("");
    setEmail("");
    setPassword("");
    setTelephone("");
    setAdresse("");
    setRoleCreation("FORMATEUR");
    setCreateError("");
  }

  // =====================================================
  // CRÉER UTILISATEUR
  // =====================================================

  async function handleCreerUtilisateur(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !nom.trim() ||
      !prenom.trim() ||
      !email.trim() ||
      !password ||
      !telephone.trim() ||
      !adresse.trim()
    ) {
      setCreateError(
        "Tous les champs sont obligatoires."
      );

      return;
    }

    try {
      setCreating(true);
      setCreateError("");

      await createUserAdmin({
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        password,
        telephone: telephone.trim(),
        adresse: adresse.trim(),
        role: roleCreation,
      });

      resetCreation();
      setShowCreateForm(false);

      await chargerUtilisateurs(
        1,
        recherche,
        roleFiltre
      );
    } catch (err: unknown) {
      console.error(
        "Erreur création utilisateur :",
        err
      );

      if (axios.isAxiosError(err)) {
        setCreateError(
          err.response?.data?.message ??
            "Impossible de créer l'utilisateur."
        );
      } else {
        setCreateError(
          "Impossible de créer l'utilisateur."
        );
      }
    } finally {
      setCreating(false);
    }
  }

  // =====================================================
  // DEMANDE DE SUPPRESSION
  // =====================================================

  function handleDemandeSuppression(
    utilisateur: UserAdmin
  ) {
    setUtilisateurASupprimer(utilisateur);

    if (
      utilisateur.role === "APPRENANT" ||
      utilisateur.role === "FORMATEUR"
    ) {
      setShowWarningSuppression(true);
      return;
    }

    setShowConfirmationSuppression(true);
  }

  // =====================================================
  // VÉRIFIER UTILISATEUR
  // =====================================================

 async function handleVerifierUtilisateur() {
  if (!utilisateurASupprimer) {
    return;
  }

  try {
    setLoadingVerification(true);

    const data =
      await checkUserDeletionAdmin(
        utilisateurASupprimer.id
      );

    setVerificationData(data);

    setShowWarningSuppression(false);
    setShowVerificationDetails(true);
  } catch (err: unknown) {
    console.error(
      "Erreur vérification utilisateur :",
      err
    );

    if (axios.isAxiosError(err)) {
      window.alert(
        err.response?.data?.message ??
          "Impossible de vérifier les données de cet utilisateur."
      );
    } else {
      window.alert(
        "Impossible de vérifier les données de cet utilisateur."
      );
    }
  } finally {
    setLoadingVerification(false);
  }
}

  // =====================================================
  // CONTINUER SUPPRESSION
  // =====================================================

  function handleContinuerSuppression() {
    setShowWarningSuppression(false);
    setShowConfirmationSuppression(true);
  }

  // =====================================================
  // ANNULER SUPPRESSION
  // =====================================================

  function handleAnnulerSuppression() {
    setShowWarningSuppression(false);
    setShowConfirmationSuppression(false);
    setUtilisateurASupprimer(null);
  }

  // =====================================================
  // CONFIRMATION FINALE
  // =====================================================

async function handleConfirmationFinale() {
  if (!utilisateurASupprimer) {
    return;
  }

  try {
    setDeleting(true);

    const resultat =
      await deleteUserAdmin(
        utilisateurASupprimer.id
      );

    setShowConfirmationSuppression(false);
    setUtilisateurASupprimer(null);

    window.alert(
      resultat.message
    );

    await chargerUtilisateurs(
      page,
      recherche,
      roleFiltre
    );
  } catch (err: unknown) {
    console.error(
      "Erreur suppression utilisateur :",
      err
    );

    if (axios.isAxiosError(err)) {
      window.alert(
        err.response?.data?.message ??
          "Impossible de supprimer cet utilisateur."
      );
    } else {
      window.alert(
        "Impossible de supprimer cet utilisateur."
      );
    }
  } finally {
    setDeleting(false);
  }
}
  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(
    date: string
  ) {
    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        dateStyle: "medium",
      }
    ).format(
      new Date(date)
    );
  }

  // =====================================================
  // LIBELLÉ RÔLE
  // =====================================================

  function roleLabel(
    role: UserRole
  ) {
    switch (role) {
      case "ADMIN":
        return "Administrateur";

      case "FORMATEUR":
        return "Formateur";

      case "APPRENANT":
        return "Apprenant";

      default:
        return role;
    }
  }

  // =====================================================
  // COULEUR RÔLE
  // =====================================================

  function roleClass(
    role: UserRole
  ) {
    switch (role) {
      case "ADMIN":
        return "bg-violet-100 text-violet-700";

      case "FORMATEUR":
        return "bg-cyan-100 text-cyan-700";

      case "APPRENANT":
        return "bg-emerald-100 text-emerald-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Administration
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Utilisateurs
              </h1>

              <p className="mt-2 text-slate-600">
                Gérez les comptes utilisateurs
                de la plateforme.
              </p>

              <p className="mt-3 text-sm text-slate-500">
                {total} utilisateur
                {total > 1 ? "s" : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCreateForm(
                  (current) => !current
                );

                setCreateError("");
              }}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              {showCreateForm
                ? "Fermer"
                : "Créer un utilisateur"}
            </button>
          </div>
        </header>

        {/* =================================================
            CRÉATION UTILISATEUR
        ================================================= */}

        {showCreateForm && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Nouvel utilisateur
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Créer un compte administrateur
              ou formateur.
            </p>

            <form
              onSubmit={
                handleCreerUtilisateur
              }
              className="mt-6"
            >
              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Nom
                  </label>

                  <input
                    type="text"
                    value={nom}
                    onChange={(event) =>
                      setNom(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Prénom
                  </label>

                  <input
                    type="text"
                    value={prenom}
                    onChange={(event) =>
                      setPrenom(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Téléphone
                  </label>

                  <input
                    type="text"
                    value={telephone}
                    onChange={(event) =>
                      setTelephone(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Adresse
                  </label>

                  <input
                    type="text"
                    value={adresse}
                    onChange={(event) =>
                      setAdresse(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Rôle
                  </label>

                  <select
                    value={roleCreation}
                    onChange={(event) =>
                      setRoleCreation(
                        event.target.value as
                          | "ADMIN"
                          | "FORMATEUR"
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-600"
                  >
                    <option value="FORMATEUR">
                      Formateur
                    </option>

                    <option value="ADMIN">
                      Administrateur
                    </option>
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Mot de passe
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
                />
              </div>

              {createError && (
                <p className="mt-4 text-sm text-red-600">
                  {createError}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetCreation();
                    setShowCreateForm(
                      false
                    );
                  }}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating
                    ? "Création..."
                    : "Créer"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* =================================================
            FILTRES
        ================================================= */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form
            onSubmit={
              handleRecherche
            }
            className="grid gap-4 lg:grid-cols-[1fr_220px_auto]"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Rechercher
              </label>

              <input
                type="search"
                value={recherche}
                onChange={(event) =>
                  setRecherche(
                    event.target.value
                  )
                }
                placeholder="Nom, prénom, email ou téléphone..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-cyan-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Rôle
              </label>

              <select
                value={roleFiltre}
                onChange={(event) =>
                  handleRoleFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-600"
              >
                <option value="">
                  Tous
                </option>

                <option value="ADMIN">
                  Administrateurs
                </option>

                <option value="FORMATEUR">
                  Formateurs
                </option>

                <option value="APPRENANT">
                  Apprenants
                </option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                Rechercher
              </button>
            </div>
          </form>

          {(recherche ||
            roleFiltre) && (
            <button
              type="button"
              onClick={() => {
                setRecherche("");
                setRoleFiltre("");

                void chargerUtilisateurs(
                  1,
                  "",
                  ""
                );
              }}
              className="mt-4 text-sm font-semibold text-cyan-700 hover:text-cyan-800"
            >
              Réinitialiser les filtres
            </button>
          )}
        </section>

        {/* =================================================
            ERREUR
        ================================================= */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =================================================
            TABLEAU
        ================================================= */}

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
            Chargement des utilisateurs...
          </div>
        ) : utilisateurs.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="font-bold text-slate-900">
              Aucun utilisateur
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Aucun utilisateur ne correspond
              à vos critères.
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">

                <thead className="bg-slate-950">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white">
                      Utilisateur
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white">
                      Email
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white">
                      Téléphone
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white">
                      Adresse
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white">
                      Rôle
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white">
                      Créé le
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-white">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {utilisateurs.map(
                    (utilisateur) => (
                      <tr
                        key={
                          utilisateur.id
                        }
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {
                              utilisateur.prenom
                            }{" "}
                            {
                              utilisateur.nom
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {
                            utilisateur.email
                          }
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                          {
                            utilisateur.telephone
                          }
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {
                            utilisateur.adresse
                          }
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleClass(
                              utilisateur.role
                            )}`}
                          >
                            {roleLabel(
                              utilisateur.role
                            )}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                          {formatDate(
                            utilisateur.createdAt
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              handleDemandeSuppression(
                                utilisateur
                              )
                            }
                            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =================================================
            PAGINATION
        ================================================= */}

        {!loading &&
          totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between gap-4">
              <button
                type="button"
                disabled={
                  page <= 1
                }
                onClick={() =>
                  void chargerUtilisateurs(
                    page - 1,
                    recherche,
                    roleFiltre
                  )
                }
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Précédent
              </button>

              <p className="text-sm text-slate-500">
                Page {page} sur{" "}
                {totalPages}
              </p>

              <button
                type="button"
                disabled={
                  page >=
                  totalPages
                }
                onClick={() =>
                  void chargerUtilisateurs(
                    page + 1,
                    recherche,
                    roleFiltre
                  )
                }
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Suivant →
              </button>
            </div>
          )}

        {/* =================================================
            MODAL 1 - AVERTISSEMENT
        ================================================= */}

        {showWarningSuppression &&
          utilisateurASupprimer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-xl font-bold text-amber-700">
                  !
                </div>

                <h2 className="mt-4 text-xl font-bold text-slate-900">
                  Vérification recommandée
                </h2>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Cet utilisateur peut être
                  toujours en activité sur la
                  plateforme.
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Vérifiez ses données et ses
                  éventuelles activités avant de
                  continuer la suppression.
                </p>

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">
                    {
                      utilisateurASupprimer.prenom
                    }{" "}
                    {
                      utilisateurASupprimer.nom
                    }
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      utilisateurASupprimer.email
                    }
                  </p>

                  <span
                    className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleClass(
                      utilisateurASupprimer.role
                    )}`}
                  >
                    {roleLabel(
                      utilisateurASupprimer.role
                    )}
                  </span>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={
                      handleAnnulerSuppression
                    }
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Annuler
                  </button>

                <button
                    type="button"
                    onClick={handleVerifierUtilisateur}
                    disabled={loadingVerification}
                    className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                    {loadingVerification
                        ? "Vérification..."
                        : "Vérifier"}
                </button>

                  <button
                    type="button"
                    onClick={
                      handleContinuerSuppression
                    }
                    className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            </div>
          )}






{showVerificationDetails &&
  verificationData &&
  utilisateurASupprimer && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900">
          Vérification des données
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {verificationData.user.prenom}{" "}
          {verificationData.user.nom}
        </p>

        {isDeleteCheckApprenant(verificationData) && (
          <div className="mt-6 space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Inscriptions
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {
                    verificationData.dependances
                      .inscriptions
                  }
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Présences
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {
                    verificationData.dependances
                      .presences
                  }
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Progressions
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {
                    verificationData.dependances
                      .progressions
                  }
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Soumissions
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {
                    verificationData.dependances
                      .soumissions
                  }
                </p>
              </div>
            </div>

            {verificationData.details.inscriptions.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900">
                  Formations concernées
                </h3>

                <div className="mt-3 space-y-2">
                  {verificationData.details.inscriptions.map(
                    (inscription) => (
                      <div
                        key={inscription.id}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <p className="font-medium text-slate-900">
                          {
                            inscription.formation
                              .titre
                          }
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Statut :{" "}
                          {inscription.statut}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

       {isDeleteCheckFormateur(verificationData) && (
          <div className="mt-6">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Affectations
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {
                  verificationData.dependances
                    .affectations
                }
              </p>
            </div>

            {verificationData.details.affectations.length > 0 && (
              <div className="mt-5">
                <h3 className="font-semibold text-slate-900">
                  Formations affectées
                </h3>

                <div className="mt-3 space-y-2">
                  {verificationData.details.affectations.map(
                    (affectation) => (
                      <div
                        key={affectation.id}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <p className="font-medium text-slate-900">
                          {
                            affectation.formation
                              .titre
                          }
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {isDeleteCheckAdmin(verificationData) && (
          <div className="mt-6">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Formations créées
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {
                  verificationData.dependances
                    .formationsCreees
                }
              </p>
            </div>

            {verificationData.raison && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {verificationData.raison}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setShowVerificationDetails(false);
              setVerificationData(null);
              setUtilisateurASupprimer(null);
            }}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
          >
            Fermer
          </button>

          {verificationData.peutSupprimer && (
            <button
              type="button"
              onClick={() => {
                setShowVerificationDetails(false);
                setShowConfirmationSuppression(true);
              }}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Continuer la suppression
            </button>
          )}
        </div>
      </div>
    </div>
  )}


          

        {/* =================================================
            MODAL 2 - CONFIRMATION FINALE
        ================================================= */}
        {showConfirmationSuppression &&
          utilisateurASupprimer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-700">
                  !
                </div>

                <h2 className="mt-4 text-xl font-bold text-slate-900">
                  Confirmer la suppression
                </h2>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Voulez-vous vraiment supprimer
                  définitivement cet utilisateur ?
                </p>

                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">
                    {utilisateurASupprimer.prenom}{" "}
                    {utilisateurASupprimer.nom}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {utilisateurASupprimer.email}
                  </p>
                </div>

                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-700">
                    Cette action sera définitive
                    et irréversible.
                  </p>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleAnnulerSuppression}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Annuler
                  </button>

                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleConfirmationFinale}
                    className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deleting
                      ? "Suppression..."
                      : "Confirmer la suppression"}
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default UtilisateursAdminPage;