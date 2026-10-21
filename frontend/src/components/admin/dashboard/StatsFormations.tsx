import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// =====================================================
// TYPES (réponse de GET /dashboard/admin)
// =====================================================

export interface StatApprenant {
  id: string;
  nom: string;
  prenom: string;
  nombreQcm: number;
  moyenne: number | null;
}

export interface StatFormation {
  id: string;
  titre: string;
  inscritsValides: number;
  nombreSoumissions: number;
  noteMoyenne: number | null;
  apprenants: StatApprenant[];
}

// =====================================================
// CONSTANTES
// =====================================================

type Vue = "FREQUENTATION" | "NOTES" | "PROGRESSION";

const VUES: { valeur: Vue; label: string; description: string }[] = [
  {
    valeur: "FREQUENTATION",
    label: "Fréquentation",
    description:
      "Nombre d'apprenants inscrits (inscriptions validées) par formation.",
  },
  {
    valeur: "NOTES",
    label: "Notes",
    description:
      "Moyenne des notes de QCM des apprenants, par formation (sur 20).",
  },
  {
    valeur: "PROGRESSION",
    label: "Progression",
    description:
      "Moyenne des QCM de chaque apprenant dans la formation choisie (sur 20).",
  },
];

const SEUIL_NOTE = 10;
const BLEU = "#0e7490";
const ORANGE = "#d97706";
const ROUGE = "#dc2626";

interface Barre {
  nom: string;
  valeur: number;
  couleur: string;
}

function raccourcir(texte: string, longueur = 24) {
  return texte.length > longueur
    ? `${texte.slice(0, longueur - 1)}…`
    : texte;
}

function couleurNote(note: number) {
  return note < SEUIL_NOTE ? ROUGE : BLEU;
}

// =====================================================
// GRAPHIQUE EN BARRES HORIZONTALES
// =====================================================

interface BarresProps {
  donnees: Barre[];
  libelle: string;
  unite?: string;
  max?: number;
  seuil?: number;
}

function Barres({ donnees, libelle, unite = "", max, seuil }: BarresProps) {
  return (
    <div style={{ height: Math.max(220, donnees.length * 44 + 40) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={donnees}
          layout="vertical"
          margin={{ top: 5, right: 24, left: 8, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />

          <XAxis
            type="number"
            domain={[0, max ?? "auto"]}
            allowDecimals={false}
          />

          <YAxis
            type="category"
            dataKey="nom"
            width={170}
            tick={{ fontSize: 12 }}
            tickFormatter={(valeur: string) => raccourcir(valeur)}
          />

          <Tooltip
            cursor={{ fill: "#f1f5f9" }}
            formatter={(valeur) => [`${valeur}${unite}`, libelle]}
          />

          {seuil !== undefined && (
            <ReferenceLine
              x={seuil}
              stroke={ROUGE}
              strokeDasharray="4 4"
            />
          )}

          <Bar dataKey="valeur" radius={[0, 6, 6, 0]}>
            {donnees.map((barre, index) => (
              <Cell key={index} fill={barre.couleur} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Vide({ texte }: { texte: string }) {
  return (
    <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      {texte}
    </p>
  );
}

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================

function StatsFormations({ stats }: { stats: StatFormation[] }) {
  const [vue, setVue] = useState<Vue>("FREQUENTATION");
  const [formationId, setFormationId] = useState("");

  // ---------- Fréquentation (stats est déjà triée, les plus suivies d'abord)
  const plusSuivies: Barre[] = stats.slice(0, 5).map((formation) => ({
    nom: formation.titre,
    valeur: formation.inscritsValides,
    couleur: BLEU,
  }));

  // Les moins suivies, sans reprendre celles déjà dans le haut du classement
  const moinsSuivies: Barre[] = stats
    .slice(5)
    .slice(-5)
    .reverse()
    .map((formation) => ({
      nom: formation.titre,
      valeur: formation.inscritsValides,
      couleur: formation.inscritsValides === 0 ? ROUGE : ORANGE,
    }));

  // ---------- Notes par formation
  const notes: Barre[] = stats
    .filter((formation) => formation.noteMoyenne !== null)
    .sort((a, b) => (b.noteMoyenne ?? 0) - (a.noteMoyenne ?? 0))
    .map((formation) => ({
      nom: formation.titre,
      valeur: formation.noteMoyenne ?? 0,
      couleur: couleurNote(formation.noteMoyenne ?? 0),
    }));

  const formationsAAmeliorer = notes.filter(
    (barre) => barre.valeur < SEUIL_NOTE
  );

  // ---------- Progression : moyenne des QCM par apprenant
  const formationsAvecApprenants = stats.filter(
    (formation) => formation.apprenants.length > 0
  );

  const formationChoisie =
    formationsAvecApprenants.find(
      (formation) => formation.id === formationId
    ) ?? formationsAvecApprenants[0];

  const progression: Barre[] = (formationChoisie?.apprenants ?? []).map(
    (apprenant) => ({
      nom: `${apprenant.prenom} ${apprenant.nom}`,
      valeur: apprenant.moyenne ?? 0,
      couleur: couleurNote(apprenant.moyenne ?? 0),
    })
  );

  const vueActive = VUES.find((item) => item.valeur === vue);

  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Statistiques des formations
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {vueActive?.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {VUES.map((item) => (
            <button
              key={item.valeur}
              type="button"
              onClick={() => setVue(item.valeur)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                vue === item.valeur
                  ? "bg-slate-900 text-cyan-300"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-cyan-500 hover:text-cyan-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {stats.length === 0 && (
          <Vide texte="Aucune formation pour le moment." />
        )}

        {/* FRÉQUENTATION */}
        {stats.length > 0 && vue === "FREQUENTATION" && (
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 font-semibold text-slate-900">
                Les plus suivies
              </h3>

              <Barres
                donnees={plusSuivies}
                libelle="Inscrits"
              />
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-slate-900">
                Les moins suivies
              </h3>

              {moinsSuivies.length === 0 ? (
                <Vide texte="Pas assez de formations pour distinguer les moins suivies." />
              ) : (
                <Barres
                  donnees={moinsSuivies}
                  libelle="Inscrits"
                />
              )}
            </div>
          </div>
        )}

        {/* NOTES */}
        {stats.length > 0 && vue === "NOTES" && (
          <>
            {notes.length === 0 ? (
              <Vide texte="Aucune note de QCM pour le moment." />
            ) : (
              <>
                <Barres
                  donnees={notes}
                  libelle="Moyenne"
                  unite="/20"
                  max={20}
                  seuil={SEUIL_NOTE}
                />

                {formationsAAmeliorer.length > 0 && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <strong>À améliorer</strong> (moyenne inférieure à{" "}
                    {SEUIL_NOTE}/20) :{" "}
                    {formationsAAmeliorer
                      .map((barre) => barre.nom)
                      .join(", ")}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* PROGRESSION */}
        {stats.length > 0 && vue === "PROGRESSION" && (
          <>
            {!formationChoisie ? (
              <Vide texte="Aucun apprenant n'a encore passé de QCM." />
            ) : (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <select
                    value={formationChoisie.id}
                    onChange={(event) => setFormationId(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-600 sm:max-w-sm"
                  >
                    {formationsAvecApprenants.map((formation) => (
                      <option key={formation.id} value={formation.id}>
                        {formation.titre}
                      </option>
                    ))}
                  </select>

                  <p className="text-sm text-slate-500">
                    {progression.length} apprenant
                    {progression.length > 1 ? "s" : ""} · moyenne de la
                    formation :{" "}
                    <strong className="text-slate-900">
                      {formationChoisie.noteMoyenne}/20
                    </strong>
                  </p>
                </div>

                <div className="mt-4">
                  <Barres
                    donnees={progression}
                    libelle="Moyenne des QCM"
                    unite="/20"
                    max={20}
                    seuil={SEUIL_NOTE}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default StatsFormations;