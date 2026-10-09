export function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

// Date locale au format AAAA-MM-JJ.
// On évite toISOString() pour ne pas décaler le jour selon le fuseau horaire.
export function toLocalDateKey(date: string) {
  const d = new Date(date);

  const annee = d.getFullYear();
  const mois = String(d.getMonth() + 1).padStart(2, "0");
  const jour = String(d.getDate()).padStart(2, "0");

  return `${annee}-${mois}-${jour}`;
}