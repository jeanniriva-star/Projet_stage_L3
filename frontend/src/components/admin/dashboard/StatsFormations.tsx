import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// =====================================================
// TYPES (réponse de GET /dashboard/admin/statistiques)
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
      "Listes des formations qui sont plus aux moins suivis par rapport aux nombres des apprenants.",
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
const ROUGE = "#dc2626";
const GRIS = "#94a3b8";

// Une couleur par part de l'anneau ; le reste est regroupé en "Autres"
const PALETTE = ["#0e7490", "#06b6d4", "#7c3aed", "#d97706", "#db2777", "#16a34a"];
const MAX_TRANCHES = PALETTE.length;

function couleurNote(note: number) {
  return note < SEUIL_NOTE ? ROUGE : BLEU;
}

function pluriel(nombre: number, mot: string) {
  return `${nombre} ${mot}${nombre > 1 ? "s" : ""}`;
}

// =====================================================
// JAUGE CIRCULAIRE (note sur 20)
// =====================================================

function Jauge({ valeur, max = 20 }: { valeur: number; max?: number }) {
  const rayon = 40;
  const circonference = 2 * Math.PI * rayon;
  const ratio = Math.min(Math.max(valeur / max, 0), 1);

  return (
    <svg
      width="104"
      height="104"
      viewBox="0 0 100 100"
      role="img"
      aria-label={`${valeur} sur ${max}`}
    >
      <circle
        cx="50"
        cy="50"
        r={rayon}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="10"
      />

      <circle
        cx="50"
        cy="50"
        r={rayon}
        fill="none"
        stroke={couleurNote(valeur)}
        strokeWidth="10"
        strokeLinecap={ratio === 0 ? "butt" : "round"}
        strokeDasharray={`${circonference * ratio} ${circonference}`}
        transform="rotate(-90 50 50)"
      />

      <text
        x="50"
        y="46"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 22, fontWeight: 700, fill: "#0f172a" }}
      >
        {valeur}
      </text>

      <text
        x="50"
        y="66"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 11, fill: "#64748b" }}
      >
        /{max}
      </text>
    </svg>
  );
}

interface ElementJauge {
  cle: string;
  nom: string;
  valeur: number;
  detail: string;
}

function GrilleJauges({ elements }: { elements: ElementJauge[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {elements.map((element) => (
        <div
          key={element.cle}
          className={`flex flex-col items-center rounded-2xl border p-5 text-center ${
            element.valeur < SEUIL_NOTE
              ? "border-red-200 bg-red-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <Jauge valeur={element.valeur} />

          <p className="mt-3 text-sm font-semibold text-slate-900">
            {element.nom}
          </p>

          <p className="mt-1 text-xs text-slate-500">{element.detail}</p>
        </div>
      ))}
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

  // ---------- Fréquentation (stats est déjà triée : les plus suivies d'abord)
  const avecInscrits = stats.filter(
    (formation) => formation.inscritsValides > 0
  );

  const totalInscrits = avecInscrits.reduce(
    (somme, formation) => somme + formation.inscritsValides,
    0
  );

  const tranches = avecInscrits.slice(0, MAX_TRANCHES).map(
    (formation, index) => ({
      nom: formation.titre,
      valeur: formation.inscritsValides,
      couleur: PALETTE[index],
    })
  );

  const autres = avecInscrits
    .slice(MAX_TRANCHES)
    .reduce((somme, formation) => somme + formation.inscritsValides, 0);

  if (autres > 0) {
    tranches.push({ nom: "Autres formations", valeur: autres, couleur: GRIS });
  }

  function couleurRang(index: number, inscrits: number) {
    return inscrits > 0 && index < MAX_TRANCHES ? PALETTE[index] : GRIS;
  }

  // ---------- Notes par formation
  const notes = stats
    .filter((formation) => formation.noteMoyenne !== null)
    .sort((a, b) => (b.noteMoyenne ?? 0) - (a.noteMoyenne ?? 0));

  const formationsAAmeliorer = notes.filter(
    (formation) => (formation.noteMoyenne ?? 0) < SEUIL_NOTE
  );

  // ---------- Progression : moyenne des QCM par apprenant
  const formationsAvecApprenants = stats.filter(
    (formation) => formation.apprenants.length > 0
  );

  const formationChoisie =
    formationsAvecApprenants.find(
      (formation) => formation.id === formationId
    ) ?? formationsAvecApprenants[0];

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

        {/* FRÉQUENTATION : anneau + classement */}
        {stats.length > 0 && vue === "FREQUENTATION" && (
          <>
            {totalInscrits === 0 ? (
              <Vide texte="Aucun inscrit validé pour le moment." />
            ) : (
              <div className="grid items-center gap-8 lg:grid-cols-[320px_1fr]">
                <div className="relative mx-auto h-72 w-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tranches}
                        dataKey="valeur"
                        nameKey="nom"
                        innerRadius="60%"
                        outerRadius="92%"
                        paddingAngle={2}
                        stroke="none"
                      >
                        {tranches.map((tranche, index) => (
                          <Cell key={index} fill={tranche.couleur} />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(valeur, nom) => [
                          pluriel(Number(valeur), "inscrit"),
                          String(nom),
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-slate-900">
                      {totalInscrits}
                    </p>

                    <p className="text-xs text-slate-500">
                      inscrit{totalInscrits > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {stats.map((formation, index) => {
                    const part = Math.round(
                      (formation.inscritsValides / totalInscrits) * 1000
                    ) / 10;

                    const estPremiere =
                      index === 0 && formation.inscritsValides > 0;

                    const estDerniere =
                      index === stats.length - 1 && stats.length > 1;

                    return (
                      <li
                        key={formation.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3"
                      >
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{
                            backgroundColor: couleurRang(
                              index,
                              formation.inscritsValides
                            ),
                          }}
                        />

                        <span
                          className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900"
                          title={formation.titre}
                        >
                          {formation.titre}
                        </span>

                        {estPremiere && (
                          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            Plus suivie
                          </span>
                        )}

                        {estDerniere && formation.inscritsValides === 0 && (
                          <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                            Aucun inscrit
                          </span>
                        )}

                        {estDerniere && formation.inscritsValides > 0 && (
                          <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            Moins suivie
                          </span>
                        )}

                        <span className="shrink-0 text-sm text-slate-600">
                          <strong className="text-slate-900">
                            {formation.inscritsValides}
                          </strong>
                          {" · "}
                          {part}%
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}

        {/* NOTES : une jauge par formation */}
        {stats.length > 0 && vue === "NOTES" && (
          <>
            {notes.length === 0 ? (
              <Vide texte="Aucune note de QCM pour le moment." />
            ) : (
              <>
                <GrilleJauges
                  elements={notes.map((formation) => ({
                    cle: formation.id,
                    nom: formation.titre,
                    valeur: formation.noteMoyenne ?? 0,
                    detail: `${pluriel(
                      formation.nombreSoumissions,
                      "QCM passé"
                    )} · ${pluriel(formation.inscritsValides, "inscrit")}`,
                  }))}
                />

                {formationsAAmeliorer.length > 0 && (
                  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <strong>À améliorer</strong> (moyenne inférieure à{" "}
                    {SEUIL_NOTE}/20) :{" "}
                    {formationsAAmeliorer
                      .map((formation) => formation.titre)
                      .join(", ")}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* PROGRESSION : une jauge par apprenant */}
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
                    {pluriel(formationChoisie.apprenants.length, "apprenant")}
                    {" · "}moyenne de la formation :{" "}
                    <strong className="text-slate-900">
                      {formationChoisie.noteMoyenne}/20
                    </strong>
                  </p>
                </div>

                <div className="mt-5">
                  <GrilleJauges
                    elements={formationChoisie.apprenants.map(
                      (apprenant) => ({
                        cle: apprenant.id,
                        nom: `${apprenant.prenom} ${apprenant.nom}`,
                        valeur: apprenant.moyenne ?? 0,
                        detail: pluriel(apprenant.nombreQcm, "QCM passé"),
                      })
                    )}
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