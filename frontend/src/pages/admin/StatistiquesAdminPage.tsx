import { useEffect, useState } from "react";

import StatsFormations, {
  type StatFormation,
} from "../../components/admin/dashboard/StatsFormations";
import { getStatistiquesAdmin } from "../../services/statistiques.service";
import { getErrorMessage } from "../../utils/errors";

function StatistiquesAdminPage() {
  const [stats, setStats] = useState<StatFormation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let annule = false;

    async function charger() {
      try {
        const data = await getStatistiquesAdmin();

        if (!annule) {
          setStats(data);
        }
      } catch (err: unknown) {
        if (annule) {
          return;
        }

        console.error("Erreur statistiques admin :", err);
        setError(
          getErrorMessage(err, "Impossible de charger les statistiques.")
        );
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
  }, []);

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Statistiques
          </h1>

          <p className="mt-2 text-slate-600">
            Suivez la fréquentation et les résultats des formations pour
            repérer celles à améliorer.
          </p>
        </header>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
            Chargement des statistiques...
          </div>
        ) : (
          !error && <StatsFormations stats={stats} />
        )}
      </div>
    </div>
  );
}

export default StatistiquesAdminPage;