import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import axios from "axios";

import {
  getFormationDetailAdmin,
  type FormationDetailAdmin,
} from "../../services/formation.service";

import {
  getCoursFormation,
} from "../../services/cours.service";

interface CoursAdmin {
  id: string;
  titre: string;
  description: string | null;
  ordre: number;
  formationId: string;
  createdAt: string;
  updatedAt: string;
}

function FormationDetailAdminPage() {
  const { formationId } =
    useParams<{
      formationId: string;
    }>();

  const [
    formation,
    setFormation,
  ] =
    useState<FormationDetailAdmin | null>(
      null
    );

  const [
    cours,
    setCours,
  ] = useState<CoursAdmin[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    let annule = false;

    async function charger() {
      if (!formationId) {
        setError(
          "Identifiant de formation manquant."
        );

        setLoading(false);
        return;
      }

      try {
        const [
          formationData,
          coursData,
        ] = await Promise.all([
          getFormationDetailAdmin(
            formationId
          ),

          getCoursFormation(
            formationId
          ),
        ]);

        if (annule) {
          return;
        }

        setFormation(
          formationData
        );

        /*
         * Si ton service getCoursFormation()
         * renvoie directement un tableau.
         */
        setCours(
        coursData.cours
      );
      } catch (err: unknown) {
        if (annule) {
          return;
        }

        console.error(
          "Erreur détail formation admin :",
          err
        );

        if (
          axios.isAxiosError(err)
        ) {
          setError(
            err.response?.data?.message ??
              "Impossible de charger la formation."
          );
        } else {
          setError(
            "Impossible de charger la formation."
          );
        }
      } finally {
        if (!annule) {
          setLoading(false);
        }
      }
    }

    charger();

    return () => {
      annule = true;
    };
  }, [formationId]);

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Chargement de la formation...
      </div>
    );
  }

  if (
    error ||
    !formation
  ) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error ||
            "Formation introuvable."}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">

        <Link
          to="/admin/formations"
          className="text-sm font-semibold text-cyan-700 hover:text-cyan-900"
        >
          ← Retour aux formations
        </Link>

        <header className="mt-6 border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Détail de la formation
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {formation.titre}
          </h1>

          {formation.description && (
            <p className="mt-3 max-w-3xl text-slate-600">
              {formation.description}
            </p>
          )}

          <p className="mt-4 text-sm text-slate-500">
            Créée par{" "}
            {formation.createur.prenom}{" "}
            {formation.createur.nom}
          </p>
        </header>

        {/* STATISTIQUES */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Cours
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {
                formation._count
                  .cours
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Formateurs
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {
                formation._count
                  .affectations
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Sessions
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {
                formation._count
                  .sessions
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Inscriptions
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {
                formation._count
                  .inscriptions
              }
            </p>
          </div>
        </section>

        {/* COURS */}

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Cours
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Cliquez sur un cours
              pour consulter son contenu
              et ses évaluations.
            </p>
          </div>

          {cours.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Aucun cours dans cette
              formation.
            </div>
          ) : (
            <div className="space-y-3">
              {cours
                .sort(
                  (
                    a,
                    b
                  ) =>
                    a.ordre -
                    b.ordre
                )
                .map(
                  (coursItem) => (
                    <Link
                      key={
                        coursItem.id
                      }
                      to={`/admin/formations/${formation.id}/cours/${coursItem.id}`}
                      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50/30"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                            Cours{" "}
                            {
                              coursItem.ordre
                            }
                          </p>

                          <h3 className="mt-1 text-lg font-bold text-slate-900">
                            {
                              coursItem.titre
                            }
                          </h3>

                          {coursItem.description && (
                            <p className="mt-2 text-sm text-slate-500">
                              {
                                coursItem.description
                              }
                            </p>
                          )}
                        </div>

                        <span className="text-xl text-slate-400">
                          →
                        </span>
                      </div>
                    </Link>
                  )
                )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default FormationDetailAdminPage;