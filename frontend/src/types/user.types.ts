export type UserRole = "ADMIN" | "FORMATEUR" | "APPRENANT";

export interface UserAdmin {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  utilisateurs: UserAdmin[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface CreateUserAdminData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone: string;
  adresse: string;
  role: "ADMIN" | "FORMATEUR";
}

// =====================================================
// VÉRIFICATION AVANT SUPPRESSION
// =====================================================

export interface DeleteCheckApprenant {
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: "APPRENANT";
  };

  peutSupprimer: boolean;
  avertissement: string | null;

  dependances: {
    inscriptions: number;
    presences: number;
    progressions: number;
    soumissions: number;
  };

  details: {
    inscriptions: {
      id: string;
      statut: "EN_ATTENTE" | "VALIDEE" | "REFUSEE";
      formation: {
        id: string;
        titre: string;
      };
    }[];
  };
}

export interface DeleteCheckFormateur {
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: "FORMATEUR";
  };

  peutSupprimer: boolean;
  avertissement: string | null;

  dependances: {
    affectations: number;
  };

  details: {
    affectations: {
      id: string;
      formation: {
        id: string;
        titre: string;
      };
    }[];
  };
}

export interface DeleteCheckAdmin {
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: "ADMIN";
  };

  peutSupprimer: boolean;
  raison: string | null;

  dependances: {
    formationsCreees: number;
  };

  details: {
    formationsCreees: {
      id: string;
      titre: string;
    }[];
  };
}

export type DeleteCheckResponse =
  | DeleteCheckApprenant
  | DeleteCheckFormateur
  | DeleteCheckAdmin;

// =====================================================
// PROFIL
// =====================================================

export interface MonProfil {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  role: UserRole;
  createdAt: string;
}

export interface UpdateProfilData {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
}