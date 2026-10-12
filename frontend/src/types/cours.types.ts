export interface CoursFormation {
  id: string;
  titre: string;
  description: string | null;
  ordre: number;
  formationId: string;

  _count: {
    ressources: number;
    evaluations: number;
    progressionCours: number;
  };
}

export interface CoursFormationResponse {
  formation: {
    id: string;
    titre: string;
  };

  cours: CoursFormation[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface CoursFormateur {
  id: string;
  titre: string;
  description: string | null;
  ordre: number;
  formationId: string;

  formation: {
    id: string;
    titre: string;
  };

  _count: {
    ressources: number;
    evaluations: number;
  };
}