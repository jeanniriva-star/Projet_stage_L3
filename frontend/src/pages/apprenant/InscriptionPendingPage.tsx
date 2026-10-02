import { Link } from "react-router-dom";

function InscriptionPendingPage() {
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
          Votre demande a bien été enregistrée. Elle doit maintenant être
          validée par l'administrateur du centre.
        </p>

        <div className="mt-6 rounded-xl bg-cyan-50 p-5">
          <h2 className="font-bold text-slate-900">
            Finaliser votre inscription
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
    </div>
  );
}

export default InscriptionPendingPage;