import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "../../components/Footer";
import { formatPrix } from "../../utils/format";

import {
  getFormationById,
  type Formation,
} from "../../services/formation.service";

function FormationDetailPage() {
  const { id } = useParams();

  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function chargerFormation() {
      if (!id) return;

      try {
        const data = await getFormationById(id);
        setFormation(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger cette formation.");
      } finally {
        setLoading(false);
      }
    }

    chargerFormation();
  }, [id]);

  if (loading) {
    return (
      <p className="p-10 text-center text-slate-500">
        Chargement...
      </p>
    );
  }

  if (error || !formation) {
    return (
      <p className="p-10 text-center text-red-600">
        {error || "Formation introuvable."}
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-900 px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl">
       <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">
        <span className="text-base">◈</span>
        Formation
        </div>

          <h1 className="mt-5 text-4xl font-bold sm:text-5xl">
            {formation.titre}
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            {formation.description || "Aucune description disponible."}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-6 py-12 lg:grid-cols-[1fr_300px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-7">
          <h2 className="text-2xl font-bold text-slate-900">
            À propos de cette formation
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            {formation.description || "Aucune information supplémentaire."}
          </p>

          <div className="mt-8 flex gap-6 text-sm text-slate-600">
            <span>
              <strong>{formation._count.cours}</strong> cours
            </span>

            <span>
              <strong>{formation._count.sessions}</strong> sessions
            </span>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Prix
          </p>

         <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatPrix(formation.prix)}
          </p>

          <Link
            to={`/register?formationId=${formation.id}`}
            className="mt-6 block rounded-xl bg-slate-900 px-5 py-3 text-center font-semibold text-white transition hover:bg-cyan-700"
            >
            S'inscrire à cette formation
          </Link>

          <Link
            to="/formations"
            className="mt-3 block text-center text-sm font-medium text-cyan-700"
          >
            ← Retour aux formations
          </Link>
        </aside>
      </section>
    </div>
  );
}

export default FormationDetailPage;
<Footer />