// Email (login)
export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

// Nettoyage : empêche de taper les mauvais caractères
export const onlyPhone = (v: string) => v.replace(/[^0-9+\s]/g, "");
export const onlyLetters = (v: string) => v.replace(/[^\p{L}\s'-]/gu, "");
export const onlyEmailChars = (v: string) => v.replace(/[^a-zA-Z0-9@.]/g, "");

// Vérification : retourne true si la valeur est valide
export const isValidPhone = (v: string) => /^\+?[0-9\s]{8,15}$/.test(v.trim());
export const isValidName = (v: string) => v.trim().length >= 2;
export const isValidPassword = (v: string) => v.length >= 8;

// Email strict (inscription) : lettres, chiffres, @ et . seulement
export const isValidEmailInscription = (v: string) =>
  /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/.test(v.trim());

// Empêche de taper autre chose que des chiffres (et un point, 2 décimales max)
export const onlyPrix = (v: string) => {
  const nettoye = v.replace(/,/g, ".").replace(/[^0-9.]/g, "");
  const [entier, ...reste] = nettoye.split(".");
  return reste.length > 0 ? `${entier}.${reste.join("").slice(0, 2)}` : entier;
};

// Prix valide : supérieur à 0, 8 chiffres max avant la virgule (comme le backend)
export const isValidPrix = (v: string) =>
  /^\d{1,8}(\.\d{1,2})?$/.test(v.trim()) && Number(v) > 0;