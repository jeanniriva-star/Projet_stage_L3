import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import { inscrireFormation } from "../../services/inscription.service";
import logoSprayInfo from "../../assets/logo_spray.jpg";
import { isValidEmail } from "../../utils/validation";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const { loginUser } = useAuth();
  const [searchParams] = useSearchParams();
  const formationId = searchParams.get("formationId");
  const [erreurEmail, setErreurEmail] = useState("");
  const [afficherMdp, setAfficherMdp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
  setErreurEmail("Format d'email invalide (exemple : nom@gmail.com)");
  return;
}

    setErreur("");
    setChargement(true);

    try {
      const data = await login({
        email,
        password: motDePasse,
    });

     loginUser(data.token, data.user);
     if (formationId && data.user.role === "APPRENANT") {
  try {
    await inscrireFormation(formationId);

    navigate(
      `/inscription-en-attente?formationId=${formationId}`
    );

    return;
  } catch (error) {
    console.error(error);

    setErreur(
      "Vous êtes peut-être déjà inscrit à cette formation."
    );

    return;
  }
}

      switch (data.user.role) {
        case "ADMIN":
          navigate("/admin");
          break;

        case "FORMATEUR":
          navigate("/formateur");
          break;

        case "APPRENANT":
          navigate("/apprenant");
          break;
      }
    } catch (error) {
      console.error(error);
      setErreur("Email ou mot de passe incorrect.");
    } finally {
      setChargement(false);
    }
  };
return (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
      
      <div className="text-center mb-8">
       <div className="flex justify-center mb-4">
          <img
            src={logoSprayInfo}
            alt="logo_spray"
            className="w-16 h-16 object-contain rounded-xl"
          />
        </div>

        <h1 className="text-3xl font-bold text-slate-900">
          Connexion
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Accédez à votre espace de formation
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Adresse email
          </label>

          <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErreurEmail("");
              }}
              required
              placeholder="exemple@email.com"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white
                        text-slate-900 placeholder:text-slate-400
                        focus:outline-none focus:ring-2 focus:ring-cyan-500
                        focus:border-cyan-500 transition"
            />
            {erreurEmail && (
              <p className="mt-2 text-sm text-red-600">{erreurEmail}</p>
            )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Mot de passe
          </label>

          <div className="relative">
            <input
              id="password"
              type={afficherMdp ? "text" : "password"}
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              placeholder="Votre mot de passe"
              className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-300 bg-white
                        text-slate-900 placeholder:text-slate-400
                        focus:outline-none focus:ring-2 focus:ring-cyan-500
                        focus:border-cyan-500 transition"
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
        </div>

        {erreur && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-600">{erreur}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-cyan-700 hover:text-cyan-800 font-medium"
          >
            Mot de passe oublié ?
          </button>
        </div>

        <button
          type="submit"
          disabled={chargement}
         className="w-full py-3 px-4 rounded-lg bg-slate-950 text-white
           font-semibold hover:bg-slate-800
           focus:outline-none focus:ring-2 focus:ring-slate-700
           focus:ring-offset-2 transition
           disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {chargement ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-400">
          Plateforme de gestion de formation en ligne
        </p>
      </div>
    </div>
  </div>
);
}

export default LoginPage;