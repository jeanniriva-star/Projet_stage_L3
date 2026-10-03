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
    email: z
        .string()
        .trim()
        .regex(/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/, "Email invalide (lettres et chiffres uniquement)"),
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
export const createUserAdminSchema = registerSchema.extend({
    role: z.enum(["ADMIN", "FORMATEUR"], "Rôle invalide"),
});
export const updateProfilSchema = registerSchema
    .pick({
    nom: true,
    prenom: true,
    email: true,
    telephone: true,
    adresse: true,
})
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
    message: "Aucune modification n'a été fournie",
});
export const changerMotDePasseSchema = z
    .object({
    ancienMotDePasse: z.string().min(1, "L'ancien mot de passe est obligatoire"),
    nouveauMotDePasse: z
        .string()
        .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
})
    .refine((data) => data.ancienMotDePasse !== data.nouveauMotDePasse, {
    message: "Le nouveau mot de passe doit être différent de l'ancien",
    path: ["nouveauMotDePasse"],
});
//# sourceMappingURL=user.schema.js.map