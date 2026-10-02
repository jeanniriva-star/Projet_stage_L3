export type Role = "ADMIN" | "FORMATEUR" | "APPRENANT";

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
}