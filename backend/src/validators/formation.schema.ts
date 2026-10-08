import { z } from "zod";

const formationBase = z.object({
  titre: z
    .string()
    .trim()
    .min(3, "Le titre doit contenir au moins 3 caractères"),

  description: z.string().trim().nullish(),

  prix: z.coerce
    .number("Le prix est obligatoire")
    .positive("Le prix doit être supérieur à 0")
    .max(99999999.99, "Prix trop élevé"),

  type: z.enum(["CONTINUE", "PROFESSIONNELLE"], "Type de formation invalide"),

  niveau: z.enum(["L1", "L2", "L3", "M1", "M2"], "Niveau invalide").nullish(),
});
// Le niveau est obligatoire pour une formation continue
const regleNiveau = (data: { type?: string; niveau?: string | null }) =>
  data.type !== "CONTINUE" || !!data.niveau;

const messageNiveau = {
  message: "Le niveau est obligatoire pour une formation continue",
  path: ["niveau"],
};

export const createFormationSchema = formationBase.refine(
  regleNiveau,
  messageNiveau
);

export const updateFormationSchema = formationBase
  .partial()
  .refine(regleNiveau, messageNiveau);