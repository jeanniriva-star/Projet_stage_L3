import { z } from "zod";

export const registerSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .regex(/^[\p{L}\s'-]+$/u, "Le nom ne doit contenir que des lettres"),

  prenom: z
    .string()
    .trim()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .regex(/^[\p{L}\s'-]+$/u, "Le prénom ne doit contenir que des lettres"),

  email: z.email("Email invalide"),

  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),

  telephone: z
    .string()
    .regex(/^\+?[0-9\s]{8,15}$/, "Téléphone invalide (chiffres uniquement)"),

  adresse: z.string().trim().min(3, "Adresse trop courte"),
});

export const loginSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});