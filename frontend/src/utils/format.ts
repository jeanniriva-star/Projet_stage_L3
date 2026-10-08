// Change cette valeur si tu utilises une autre devise
const DEVISE = "Ar";

export function formatPrix(prix: string | number) {
  const valeur = Number(prix);

  // Les formations créées avant l'ajout du prix ont la valeur 0
  if (!valeur || valeur <= 0) {
    return "À définir";
  }

  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(valeur)} ${DEVISE}`;
}
export const NIVEAUX = ["L1", "L2", "L3", "M1", "M2"] as const;

export function formatType(type: string) {
  return type === "CONTINUE" ? "Continue" : "Professionnelle";
}