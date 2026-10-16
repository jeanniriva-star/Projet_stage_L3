import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import PaiementModal from "../../components/apprenant/PaiementModal";
import { formatPrix } from "../../utils/format";

type FormationPaiement = {
  id: string;
  titre: string;
  prix: string;
};

function InscriptionPendingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // La formation est transmise par la page qui a envoyé l'inscription
  const formation = (
    location.state as { formation?: FormationPaiement } | null
  )?.formation;

  const [showPaiement, setShowPaiement] = useState(false);

  const peutPayer = formation !== undefined && Number(formation.prix) > 0;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-5 inline-flex rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
          En attente de validation
        </div>

        <h1 className="text-3xl font-bold text-slate-900">
          Demande d'inscription envoyée
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          Votre demande a bien été enregistrée.
          {peutPayer
            ? " Payez maintenant pour valider immédiatement votre inscription."
            : " Elle doit maintenant être validée par l'administrateur du centre."}
        </p>

        {peutPayer && formation && (
          <div className="mt-6 rounded-xl border border-cyan-200 bg-cyan-50 p-5">
            <h2 className="font-bold text-slate-900">Payer maintenant</h2>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              Réglez votre formation par Mobile Money : votre inscription sera
              validée dès que le paiement est confirmé.
            </p>

            <button
              type="button"
              onClick={() => setShowPaiement(true)}
              className="mt-4 rounded-xl bg-cyan-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800"
            >
              Payer {formatPrix(formation.prix)}
            </button>
          </div>
        )}

        <div className="mt-6 rounded-xl bg-slate-50 p-5">
          <h2 className="font-bold text-slate-900">
            {peutPayer
              ? "Vous préférez payer au centre ?"
              : "Finaliser votre inscription"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            Pour obtenir les informations concernant le paiement, veuillez
            contacter le centre :
          </p>

          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p>
              Email : <strong>sprayinfo@gmail.com</strong>
            </p>

            <p>
              WhatsApp : <strong>+261 34 68 275 62</strong>
            </p>

            <p>
              Facebook : <strong>SprayInfo</strong>
            </p>
          </div>
        </div>

        <p className="mt-6 font-medium text-slate-800">
          Consultez régulièrement votre adresse e-mail afin de voir la réponse
          du centre concernant votre inscription.
        </p>

        <p className="mt-3 text-sm text-slate-600">
          L'accès aux cours, sessions et évaluations sera disponible seulement
          après validation.
        </p>

        <Link
          to="/apprenant"
          className="mt-8 inline-block rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-cyan-700"
        >
          Aller à mon espace
        </Link>
      </div>

      {showPaiement && formation && (
        <PaiementModal
          formation={formation}
          onFermer={() => setShowPaiement(false)}
          onTermine={() => navigate("/apprenant")}
        />
      )}
    </div>
  );
}

export default InscriptionPendingPage;