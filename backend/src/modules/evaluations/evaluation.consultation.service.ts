import prisma from "../../config/prisma.js";
import type { Role } from "../../generated/prisma/enums.js";

import { verifierAccesFormation } from "../affectations/affectation.service.js";

// ======================================================
// OUTILS
// ======================================================

function construirePagination(
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}

// ======================================================
// LISTE DES ÉVALUATIONS D'UNE FORMATION
// ======================================================

interface GetEvaluationsFormationParams {
  formationId: string;
  userId: string;
  role: Role;
  page: number;
  limit: number;
  search?: string;
  type?: "QCM" | "DEVOIR";
}

export async function getEvaluationsByFormation(
  params: GetEvaluationsFormationParams
) {
  const {
    formationId,
    userId,
    role,
    page,
    limit,
    search,
    type,
  } = params;

  // 1. Vérifier que la formation existe
  const formation = await prisma.formation.findUnique({
    where: {
      id: formationId,
    },

    select: {
      id: true,
      titre: true,
    },
  });

  if (!formation) {
    throw new Error("Formation introuvable");
  }

  // 2. Contrôle des droits
  if (role === "FORMATEUR") {
    await verifierAccesFormation(
      userId,
      role,
      formationId
    );
  } else if (role !== "ADMIN") {
    throw new Error(
      "Vous n'êtes pas autorisé à consulter ces évaluations"
    );
  }

  const skip = (page - 1) * limit;

  // 3. Filtres
  const where = {
    cours: {
      formationId,
    },

    ...(type !== undefined && {
      type,
    }),

    ...(search !== undefined &&
      search.trim() !== "" && {
        OR: [
          {
            titre: {
              contains: search.trim(),
              mode: "insensitive" as const,
            },
          },
          {
            description: {
              contains: search.trim(),
              mode: "insensitive" as const,
            },
          },
          {
            cours: {
              formationId,
              titre: {
                contains: search.trim(),
                mode: "insensitive" as const,
              },
            },
          },
        ],
      }),
  };

  // 4. Liste + nombre total
  const [evaluations, total] = await Promise.all([
    prisma.evaluation.findMany({
      where,

      skip,
      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        titre: true,
        description: true,
        type: true,
        createdAt: true,

        cours: {
          select: {
            id: true,
            titre: true,
            ordre: true,
          },
        },

        _count: {
          select: {
            questions: true,
            soumissions: true,
          },
        },
      },
    }),

    prisma.evaluation.count({
      where,
    }),
  ]);

  return {
    formation,

    evaluations,

    pagination: construirePagination(page, limit, total),
  };
}

// ======================================================
// DÉTAIL D'UNE ÉVALUATION
// ======================================================

export async function getEvaluationDetail(
  evaluationId: string,
  userId: string,
  role: Role
) {
  const evaluation = await prisma.evaluation.findUnique({
    where: {
      id: evaluationId,
    },

    select: {
      id: true,
      titre: true,
      description: true,
      type: true,
      createdAt: true,

      cours: {
        select: {
          id: true,
          titre: true,
          formationId: true,

          formation: {
            select: {
              id: true,
              titre: true,
            },
          },
        },
      },

      questions: {
        select: {
          id: true,
          contenu: true,

          choix: {
            select: {
              id: true,
              texte: true,
              correct: true,
            },
          },
        },
      },

      _count: {
        select: {
          questions: true,
          soumissions: true,
        },
      },
    },
  });

  if (!evaluation) {
    throw new Error("Évaluation introuvable");
  }

  if (role === "FORMATEUR") {
    await verifierAccesFormation(
      userId,
      role,
      evaluation.cours.formationId
    );
  } else if (role !== "ADMIN") {
    throw new Error(
      "Vous n'êtes pas autorisé à consulter cette évaluation"
    );
  }

  return {
    id: evaluation.id,
    titre: evaluation.titre,
    description: evaluation.description,
    type: evaluation.type,
    createdAt: evaluation.createdAt,

    cours: evaluation.cours,

    questions: evaluation.questions,

    nombreQuestions:
      evaluation._count.questions,

    nombreSoumissions:
      evaluation._count.soumissions,

    // Très utile pour React :
    // si true, les questions ne doivent plus être modifiées.
    verrouille:
      evaluation._count.soumissions > 0,
  };
}

// ======================================================
// RÉSULTATS D'UNE ÉVALUATION
// ======================================================

interface GetResultatsEvaluationOptions {
  page?: number;
  limit?: number;
  search?: string;
  noteMin?: number;
  noteMax?: number;
}

export async function getResultatsEvaluation(
  evaluationId: string,
  userId: string,
  role: Role,
  options: GetResultatsEvaluationOptions = {}
) {
  const {
    page = 1,
    limit = 10,
    search,
    noteMin,
    noteMax,
  } = options;

  const evaluation = await prisma.evaluation.findUnique({
    where: {
      id: evaluationId,
    },

    include: {
      cours: true,
    },
  });

  if (!evaluation) {
    throw new Error("Évaluation introuvable");
  }

  // FORMATEUR : uniquement ses formations
  if (role === "FORMATEUR") {
    await verifierAccesFormation(
      userId,
      role,
      evaluation.cours.formationId
    );
  } else if (role !== "ADMIN") {
    throw new Error(
      "Vous n'êtes pas autorisé à consulter ces résultats"
    );
  }

  const skip = (page - 1) * limit;

  const where = {
    evaluationId,

    ...((noteMin !== undefined ||
      noteMax !== undefined) && {
      note: {
        ...(noteMin !== undefined && {
          gte: noteMin,
        }),

        ...(noteMax !== undefined && {
          lte: noteMax,
        }),
      },
    }),

    ...(search !== undefined &&
      search.trim() !== "" && {
        inscription: {
          apprenant: {
            OR: [
              {
                nom: {
                  contains: search.trim(),
                  mode: "insensitive" as const,
                },
              },
              {
                prenom: {
                  contains: search.trim(),
                  mode: "insensitive" as const,
                },
              },
              {
                email: {
                  contains: search.trim(),
                  mode: "insensitive" as const,
                },
              },
            ],
          },
        },
      }),
  };

  const [soumissions, total] = await Promise.all([
    prisma.soumissionEvaluation.findMany({
      where,

      skip,
      take: limit,

      orderBy: {
        dateSoumission: "desc",
      },

      select: {
        id: true,
        note: true,
        dateSoumission: true,

        inscription: {
          select: {
            apprenant: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
              },
            },
          },
        },
      },
    }),

    prisma.soumissionEvaluation.count({
      where,
    }),
  ]);

  return {
    evaluation: {
      id: evaluation.id,
      titre: evaluation.titre,
      type: evaluation.type,

      cours: {
        id: evaluation.cours.id,
        titre: evaluation.cours.titre,
      },
    },

    soumissions,

    pagination: construirePagination(page, limit, total),
  };
}