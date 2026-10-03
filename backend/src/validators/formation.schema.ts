import { z } from "zod";

export const createFormationSchema = z.object({
  titre: z
    .string()
    .trim()
    .min(3, "Le titre doit contenir au moins 3 caractères"),

 description: z.string().trim().nullish(),

  prix: z.coerce
    .number("Le prix est obligatoire")
    .positive("Le prix doit être supérieur à 0")
    .max(99999999.99, "Prix trop élevé"),
});

export const updateFormationSchema = createFormationSchema.partial();