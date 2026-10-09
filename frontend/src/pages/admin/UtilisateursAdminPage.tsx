import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  checkUserDeletionAdmin,
  createUserAdmin,
  deleteUserAdmin,
  getUsersAdmin,
} from "../../services/user.service";
import type {
  CreateUserAdminData,
  DeleteCheckResponse,
  UserAdmin,
} from "../../types/user.types";
import { getErrorMessage } from "../../utils/errors";
import Pagination from "../../components/common/Pagination";
import UserCreateForm from "../../components/admin/utilisateurs/UserCreateForm";
import UsersFilters from "../../components/admin/utilisateurs/UsersFilters";
import UsersTable from "../../components/admin/utilisateurs/UsersTable";
import DeleteWarningModal from "../../components/admin/utilisateurs/DeleteWarningModal";
import DeleteVerificationModal from "../../components/admin/utilisateurs/DeleteVerificationModal";
import DeleteConfirmModal from "../../components/admin/utilisateurs/DeleteConfirmModal";

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
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // =====================================================
  // SUPPRESSION
  // =====================================================

  const [utilisateurASupprimer, setUtilisateurASupprimer] =
    useState<UserAdmin | null>(null);
  const [showWarningSuppression, setShowWarningSuppression] = useState(false);
  const [showConfirmationSuppression, setShowConfirmationSuppression] =
    useState(false);
  const [deleting, setDeleting] = useState(false);

  const [verificationData, setVerificationData] =
    useState<DeleteCheckResponse | null>(null);
  const [loadingVerification, setLoadingVerification] = useState(false);
  const [showVerificationDetails, setShowVerificationDetails] = useState(false);

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
      console.error("Erreur utilisateurs admin :", err);
      setError(getErrorMessage(err, "Impossible de charger les utilisateurs."));
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
        const data = await getUsersAdmin(1, 10, "", "");

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

        console.error("Erreur utilisateurs admin :", err);
        setError(getErrorMessage(err, "Impossible de charger les utilisateurs."));
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
  // RECHERCHE ET FILTRES
  // =====================================================

  async function handleRecherche(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await chargerUtilisateurs(1, recherche, roleFiltre);
  }

  async function handleRoleFilter(role: string) {
    setRoleFiltre(role);

    await chargerUtilisateurs(1, recherche, role);
  }

  function handleResetFiltres() {
    setRecherche("");
    setRoleFiltre("");

    void chargerUtilisateurs(1, "", "");
  }

  // =====================================================
  // CRÉER UTILISATEUR
  // =====================================================

  async function handleCreerUtilisateur(data: CreateUserAdminData) {
    try {
      setCreating(true);
      setCreateError("");

      await createUserAdmin(data);

      setShowCreateForm(false);

      await chargerUtilisateurs(1, recherche, roleFiltre);
    } catch (err: unknown) {
      console.error("Erreur création utilisateur :", err);
      setCreateError(getErrorMessage(err, "Impossible de créer l'utilisateur."));
    } finally {
      setCreating(false);
    }
  }

  // =====================================================
  // SUPPRESSION
  // =====================================================

  function handleDemandeSuppression(utilisateur: UserAdmin) {
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

  async function handleVerifierUtilisateur() {
    if (!utilisateurASupprimer) {
      return;
    }

    try {
      setLoadingVerification(true);

      const data = await checkUserDeletionAdmin(utilisateurASupprimer.id);

      setVerificationData(data);

      setShowWarningSuppression(false);
      setShowVerificationDetails(true);
    } catch (err: unknown) {
      console.error("Erreur vérification utilisateur :", err);
      window.alert(
        getErrorMessage(
          err,
          "Impossible de vérifier les données de cet utilisateur."
        )
      );
    } finally {
      setLoadingVerification(false);
    }
  }

  function handleContinuerSuppression() {
    setShowWarningSuppression(false);
    setShowConfirmationSuppression(true);
  }

  function handleAnnulerSuppression() {
    setShowWarningSuppression(false);
    setShowConfirmationSuppression(false);
    setUtilisateurASupprimer(null);
  }

  function handleFermerVerification() {
    setShowVerificationDetails(false);
    setVerificationData(null);
    setUtilisateurASupprimer(null);
  }

  function handleContinuerApresVerification() {
    setShowVerificationDetails(false);
    setShowConfirmationSuppression(true);
  }

  async function handleConfirmationFinale() {
    if (!utilisateurASupprimer) {
      return;
    }

    try {
      setDeleting(true);

      const resultat = await deleteUserAdmin(utilisateurASupprimer.id);

      setShowConfirmationSuppression(false);
      setUtilisateurASupprimer(null);

      window.alert(resultat.message);

      await chargerUtilisateurs(page, recherche, roleFiltre);
    } catch (err: unknown) {
      console.error("Erreur suppression utilisateur :", err);
      window.alert(
        getErrorMessage(err, "Impossible de supprimer cet utilisateur.")
      );
    } finally {
      setDeleting(false);
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
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
                Gérez les comptes utilisateurs de la plateforme.
              </p>

              <p className="mt-3 text-sm text-slate-500">
                {total} utilisateur
                {total > 1 ? "s" : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCreateForm((current) => !current);
                setCreateError("");
              }}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              {showCreateForm ? "Fermer" : "Créer un utilisateur"}
            </button>
          </div>
        </header>

        {showCreateForm && (
          <UserCreateForm
            creating={creating}
            createError={createError}
            onSubmit={handleCreerUtilisateur}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        <UsersFilters
          recherche={recherche}
          roleFiltre={roleFiltre}
          onRechercheChange={setRecherche}
          onRoleChange={handleRoleFilter}
          onSubmit={handleRecherche}
          onReset={handleResetFiltres}
        />

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
            Chargement des utilisateurs...
          </div>
        ) : utilisateurs.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="font-bold text-slate-900">Aucun utilisateur</h2>

            <p className="mt-2 text-sm text-slate-500">
              Aucun utilisateur ne correspond à vos critères.
            </p>
          </div>
        ) : (
          <UsersTable
            utilisateurs={utilisateurs}
            onDelete={handleDemandeSuppression}
          />
        )}

        {!loading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(nouvellePage) =>
              void chargerUtilisateurs(nouvellePage, recherche, roleFiltre)
            }
          />
        )}

        {showWarningSuppression && utilisateurASupprimer && (
          <DeleteWarningModal
            utilisateur={utilisateurASupprimer}
            loadingVerification={loadingVerification}
            onCancel={handleAnnulerSuppression}
            onVerify={handleVerifierUtilisateur}
            onContinue={handleContinuerSuppression}
          />
        )}

        {showVerificationDetails && verificationData && utilisateurASupprimer && (
          <DeleteVerificationModal
            data={verificationData}
            onClose={handleFermerVerification}
            onContinue={handleContinuerApresVerification}
          />
        )}

        {showConfirmationSuppression && utilisateurASupprimer && (
          <DeleteConfirmModal
            utilisateur={utilisateurASupprimer}
            deleting={deleting}
            onCancel={handleAnnulerSuppression}
            onConfirm={handleConfirmationFinale}
          />
        )}
      </div>
    </div>
  );
}

export default UtilisateursAdminPage;