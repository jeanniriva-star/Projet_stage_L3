import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3"
              required
            />

            <input
              type="text"
              placeholder="Prénom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3"
              required
            />
          </div>

          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            required
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            required
          />

          <input
            type="tel"
            placeholder="Téléphone"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            required
          />

          <input
            type="text"
            placeholder="Adresse"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            required
          />

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