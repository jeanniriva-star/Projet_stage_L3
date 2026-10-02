import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  getMonProfil,
  updateMonProfil,
  changerMotDePasse,
  type MonProfil,
} from "../services/user.service";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  FORMATEUR: "Formateur",
  APPRENANT: "Apprenant",
};

function ProfilPage() {
  const { updateUser } = useAuth();

  const [profil, setProfil] = useState<MonProfil | null>(null);
  const [loading, setLoading] = useState(true);

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");

  const [savingInfo, setSavingInfo] = useState(false);
  const [infoError, setInfoError] = useState("");
  const [infoSuccess, setInfoSuccess] = useState("");

  const [ancienMotDePasse, setAncienMotDePasse] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    async function charger() {
      try {
        const data = await getMonProfil();
        setProfil(data);
        setNom(data.nom);
        setPrenom(data.prenom);
        setEmail(data.email);
        setTelephone(data.telephone);
        setAdresse(data.adresse);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    charger();
  }, []);

  async function handleSubmitInfo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInfoError("");
    setInfoSuccess("");

    if (!nom.trim() || !prenom.trim() || !email.trim() || !telephone.trim() || !adresse.trim()) {
      setInfoError("Tous les champs sont obligatoires.");
      return;
    }

    try {
      setSavingInfo(true);
      const result = await updateMonProfil({
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
        adresse: adresse.trim(),
      });

      setProfil(result.user);
      updateUser({
        id: result.user.id,
        nom: result.user.nom,
        prenom: result.user.prenom,
        email: result.user.email,
        role: result.user.role,
      });
      setInfoSuccess("Profil mis à jour avec succès.");
    } catch (err) {
      const message =
        err instanceof Error && "response" in err
          ? // @ts-expect-error - axios error shape
            err.response?.data?.message
          : undefined;
      setInfoError(message ?? "Impossible de mettre à jour le profil.");
    } finally {
      setSavingInfo(false);
    }
  }

  async function handleSubmitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!ancienMotDePasse || !nouveauMotDePasse || !confirmationMotDePasse) {
      setPasswordError("Tous les champs sont obligatoires.");
      return;
    }

    if (nouveauMotDePasse.length < 8) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (nouveauMotDePasse !== confirmationMotDePasse) {
      setPasswordError("La confirmation ne correspond pas au nouveau mot de passe.");
      return;
    }

    try {
      setSavingPassword(true);
      await changerMotDePasse(ancienMotDePasse, nouveauMotDePasse);
      setPasswordSuccess("Mot de passe modifié avec succès.");
      setAncienMotDePasse("");
      setNouveauMotDePasse("");
      setConfirmationMotDePasse("");
    } catch (err) {
      const message =
        err instanceof Error && "response" in err
          ? // @ts-expect-error - axios error shape
            err.response?.data?.message
          : undefined;
      setPasswordError(message ?? "Impossible de modifier le mot de passe.");
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-slate-500">Chargement du profil...</div>;
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <header>
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            {profil ? ROLE_LABELS[profil.role] : ""}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Mon profil</h1>
          <p className="mt-2 text-slate-600">
            Gérez vos informations personnelles et votre mot de passe.
          </p>
        </header>

        {/* Informations personnelles */}
        <form
          onSubmit={handleSubmitInfo}
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-900">Informations personnelles</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Prénom</label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Nom</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Téléphone
              </label>
              <input
                type="text"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Adresse</label>
              <input
                type="text"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>
          </div>

          {infoError && <p className="mt-4 text-sm text-red-600">{infoError}</p>}
          {infoSuccess && <p className="mt-4 text-sm text-emerald-600">{infoSuccess}</p>}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={savingInfo}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {savingInfo ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>

        {/* Mot de passe */}
        <form
          onSubmit={handleSubmitPassword}
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-900">Changer le mot de passe</h2>

          <div className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={ancienMotDePasse}
                onChange={(e) => setAncienMotDePasse(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={nouveauMotDePasse}
                onChange={(e) => setNouveauMotDePasse(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
              <p className="mt-1 text-xs text-slate-500">Au moins 8 caractères.</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={confirmationMotDePasse}
                onChange={(e) => setConfirmationMotDePasse(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>
          </div>

          {passwordError && <p className="mt-4 text-sm text-red-600">{passwordError}</p>}
          {passwordSuccess && (
            <p className="mt-4 text-sm text-emerald-600">{passwordSuccess}</p>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {savingPassword ? "Modification..." : "Changer le mot de passe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfilPage;