import type {
  DeleteCheckAdmin,
  DeleteCheckApprenant,
  DeleteCheckFormateur,
  DeleteCheckResponse,
  UserRole,
} from "../types/user.types";

export function isDeleteCheckApprenant(
  data: DeleteCheckResponse
): data is DeleteCheckApprenant {
  return data.user.role === "APPRENANT";
}

export function isDeleteCheckFormateur(
  data: DeleteCheckResponse
): data is DeleteCheckFormateur {
  return data.user.role === "FORMATEUR";
}

export function isDeleteCheckAdmin(
  data: DeleteCheckResponse
): data is DeleteCheckAdmin {
  return data.user.role === "ADMIN";
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  }).format(new Date(date));
}

export function roleLabel(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return "Administrateur";
    case "FORMATEUR":
      return "Formateur";
    case "APPRENANT":
      return "Apprenant";
    default:
      return role;
  }
}

export function roleClass(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return "bg-violet-100 text-violet-700";
    case "FORMATEUR":
      return "bg-cyan-100 text-cyan-700";
    case "APPRENANT":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}