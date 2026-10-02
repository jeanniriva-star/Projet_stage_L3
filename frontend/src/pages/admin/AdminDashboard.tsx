import {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";
import axios from "axios";

import {
  getAdminDashboard,
  type AdminDashboardData,
} from "../../services/admin.service";

function AdminDashboard() {
  const [ 
    dashboard,
    setDashboard,
  ] =
    useState<AdminDashboardData | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    async function chargerDashboard() {
      try {
        const data =
          await getAdminDashboard();

        setDashboard(data);
      } catch (error: unknown) {
        console.error(
          "Erreur dashboard admin :",
          error
        );

        if (
          axios.isAxiosError(error)
        ) {
          setError(
            error.response?.data
              ?.message ??
              "Impossible de charger le tableau de bord."
          );
        } else {
          setError(
            "Impossible de charger le tableau de bord."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    chargerDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Chargement du tableau de bord...
      </div>
    );
  }

  if (
    error ||
    !dashboard
  ) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error ||
            "Impossible de charger le tableau de bord."}
        </div>
      </div>
    );
  }

  const cartes = [
    {
      titre: "Utilisateurs",
      valeur:
        dashboard.utilisateurs
          .total,
      description:
        `${dashboard.utilisateurs.formateurs} formateur(s) · ${dashboard.utilisateurs.apprenants} apprenant(s)`,
    },

    {
      titre: "Formations",
      valeur:
        dashboard.formations,
      description:
        "Formations disponibles",
    },

    {
      titre:
        "Inscriptions en attente",
      valeur:
        dashboard.inscriptions
          .enAttente,
      description:
        "Demandes à traiter",
    },

    {
      titre: "Sessions",
      valeur:
        dashboard.sessions,
      description:
        "Sessions enregistrées",
    },

    {
      titre: "Évaluations",
      valeur:
        dashboard.evaluations,
      description:
        "Évaluations créées",
    },
  ];

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <header className="border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Tableau de bord
          </h1>

          <p className="mt-2 max-w-3xl text-slate-600">
            Vue générale de la plateforme
            Spray_info et accès rapide aux
            principales fonctions
            d'administration.
          </p>
        </header>

        {/* CARTES STATISTIQUES */}

        <section className="mt-8">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
            {cartes.map(
              (carte) => (
                <article
                  key={carte.titre}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <p className="text-sm font-medium text-slate-500">
                    {carte.titre}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {carte.valeur}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {
                      carte.description
                    }
                  </p>
                </article>
              )
            )}
          </div>
        </section>

        {/* INSCRIPTIONS EN ATTENTE */}

        {dashboard.inscriptions
          .enAttente > 0 && (
          <section className="mt-8">
            <div className="flex flex-col gap-5 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />

                  <h2 className="font-bold text-slate-900">
                    Inscriptions à
                    traiter
                  </h2>
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  {
                    dashboard
                      .inscriptions
                      .enAttente
                  }{" "}
                  demande
                  {dashboard
                    .inscriptions
                    .enAttente > 1
                    ? "s"
                    : ""}{" "}
                  en attente de
                  validation.
                </p>
              </div>

              <Link
                to="/admin/inscriptions"
                className="shrink-0 rounded-xl bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                Gérer les inscriptions
              </Link>
            </div>
          </section>
        )}

        {/* ACCÈS RAPIDES */}

        <section className="mt-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Gestion
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Accédez rapidement aux
              différents modules
              d'administration.
            </p>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Link
              to="/admin/inscriptions"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-cyan-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-900">
                  I
                </div>

                {dashboard
                  .inscriptions
                  .enAttente >
                  0 && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    {
                      dashboard
                        .inscriptions
                        .enAttente
                    }
                  </span>
                )}
              </div>

              <h3 className="mt-5 font-bold text-slate-900">
                Inscriptions
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Valider ou refuser les
                demandes d'inscription.
              </p>

              <p className="mt-4 text-sm font-semibold text-cyan-700">
                Gérer →
              </p>
            </Link>

            <Link
              to="/admin/utilisateurs"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-cyan-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-900">
                U
              </div>

              <h3 className="mt-5 font-bold text-slate-900">
                Utilisateurs
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Consulter les comptes,
                créer des utilisateurs
                et gérer les rôles.
              </p>

              <p className="mt-4 text-sm font-semibold text-cyan-700">
                Gérer →
              </p>
            </Link>

            <Link
              to="/admin/formations"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-cyan-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-900">
                F
              </div>

              <h3 className="mt-5 font-bold text-slate-900">
                Formations
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Créer, modifier et
                organiser les
                formations.
              </p>

              <p className="mt-4 text-sm font-semibold text-cyan-700">
                Gérer →
              </p>
            </Link>

            <Link
              to="/admin/affectations"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-cyan-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-900">
                A
              </div>

              <h3 className="mt-5 font-bold text-slate-900">
                Affectations
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Affecter les formateurs
                aux formations.
              </p>

              <p className="mt-4 text-sm font-semibold text-cyan-700">
                Gérer →
              </p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;