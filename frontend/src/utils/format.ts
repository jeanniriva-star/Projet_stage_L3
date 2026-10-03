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