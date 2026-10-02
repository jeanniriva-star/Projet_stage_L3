import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import {
  onlyLetters,
  onlyPhone,
  onlyEmailChars,
  isValidName,
  isValidEmailInscription,
  isValidPassword,
  isValidPhone,
} from "../../utils/validation";

import { register } from "../../services/auth.service";

function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const formationId = searchParams.get("formationId");

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [afficherMdp, setAfficherMdp] = useState(false);

const effacerErreur = (champ: string) =>
  setErreurs((prev) => ({ ...prev, [champ]: "" }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nouvellesErreurs: Record<string, string> = {};

if (!isValidName(nom)) nouvellesErreurs.nom = "Au moins 2 lettres";
if (!isValidName(prenom)) nouvellesErreurs.prenom = "Au moins 2 lettres";
if (!isValidEmailInscription(email)) nouvellesErreurs.email = "Uniquement lettres et chiffres (exemple : nom@domaine.com)";
if (!isValidPassword(password)) nouvellesErreurs.password = "Minimum 8 caractères";
if (!isValidPhone(telephone)) nouvellesErreurs.telephone = "8 à 15 chiffres (le + est accepté au début)";
if (adresse.trim().length < 3) nouvellesErreurs.adresse = "Adresse trop courte";

if (Object.keys(nouvellesErreurs).length > 0) {
  setErreurs(nouvellesErreurs);
  return;
}

setErreurs({});

    try {
      setLoading(true);
      setError("");

      await register({
        nom,
        prenom,
        email,
        password,
        telephone,
        adresse,
      });

      if (formationId) {
        navigate(`/login?formationId=${formationId}`);
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de créer le compte.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          Créer un compte
        </h1>

        <p className="mt-2 text-slate-600">
          Créez votre compte apprenant pour continuer l'inscription.
        </p>

        {error && (
          <p className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <input
              type="text"
              placeholder="Nom"
              value={nom}
              onChange={(e) => {
                setNom(onlyLetters(e.target.value));
                effacerErreur("nom");
              }}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              required
            />
            {erreurs.nom && <p className="mt-1 text-sm text-red-600">{erreurs.nom}</p>}
          </div>

          <div>
            <input
              type="text"
              placeholder="Prénom"
              value={prenom}
              onChange={(e) => {
                setPrenom(onlyLetters(e.target.value));
                effacerErreur("prenom");
              }}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              required
            />
            {erreurs.prenom && <p className="mt-1 text-sm text-red-600">{erreurs.prenom}</p>}
          </div>
        </div>

        <div>
          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => {
              setEmail(onlyEmailChars(e.target.value));
              effacerErreur("email");
            }}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            required
          />
          {erreurs.email && <p className="mt-1 text-sm text-red-600">{erreurs.email}</p>}
        </div>

        <div>
          <div>
            <div className="relative">
              <input
                type={afficherMdp ? "text" : "password"}
                placeholder="Mot de passe (8 caractères minimum)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  effacerErreur("password");
                }}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12"
                required
              />

              <button
                type="button"
                onClick={() => setAfficherMdp(!afficherMdp)}
                aria-label={afficherMdp ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                className="absolute inset-y-0 right-0 flex items-center px-4
                          text-slate-400 hover:text-slate-600"
              >
                {afficherMdp ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {erreurs.password && <p className="mt-1 text-sm text-red-600">{erreurs.password}</p>}
          </div>
          {erreurs.password && <p className="mt-1 text-sm text-red-600">{erreurs.password}</p>}
        </div>

        <div>
          <input
            type="tel"
            placeholder="Téléphone"
            value={telephone}
            onChange={(e) => {
              setTelephone(onlyPhone(e.target.value));
              effacerErreur("telephone");
            }}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            required
          />
          {erreurs.telephone && <p className="mt-1 text-sm text-red-600">{erreurs.telephone}</p>}
        </div>

        <div>
          <input
            type="text"
            placeholder="Adresse"
            value={adresse}
            onChange={(e) => {
              setAdresse(e.target.value);
              effacerErreur("adresse");
            }}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            required
          />
          {erreurs.adresse && <p className="mt-1 text-sm text-red-600">{erreurs.adresse}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Déjà un compte ?{" "}
          <Link
            to={
              formationId
                ? `/login?formationId=${formationId}`
                : "/login"
            }
            className="font-semibold text-cyan-700"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;