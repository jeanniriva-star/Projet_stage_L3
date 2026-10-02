import prisma from "../../config/prisma.js";
import type { Role } from "../../generated/prisma/enums.js";
import {
  sendAffectationFormateurEmail,
} from "../../services/email.service.js";

interface CreateAffectationData {
  formationId: string;
  formateurId: string;
}

  export async function createAffectation(data: CreateAffectationData) {
 
  const formateur = await prisma.user.findUnique({
    where: {
      id: data.formateurId,
    },
  });

  if (!formateur) {
    throw new Error("Formateur introuvable");
  }

  if (formateur.role !== "FORMATEUR") {
    throw new Error("Cet utilisateur n'est pas un formateur");
  }

  const formation = await prisma.formation.findUnique({
    where: {
      id: data.formationId,
    },
  });

  if (!formation) {
    throw new Error("Formation introuvable");
  }

  const existingAffectation =
    await prisma.affectationFormateur.findUnique({
      where: {
        formationId_formateurId: {
          formationId: data.formationId,
          formateurId: data.formateurId,
        },
      },
    });

  if (existingAffectation) {
    throw new Error("Ce formateur est déjà affecté à cette formation");
  }

  
 const nouvelleAffectation =
  await prisma.affectationFormateur.create({
    data: {
      formationId: data.formationId,
      formateurId: data.formateurId,
    },

    include: {
      formation: true,

      formateur: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          role: true,
        },
      },
    },
  });

try {
  await sendAffectationFormateurEmail(
    nouvelleAffectation.formateur.email,
    nouvelleAffectation.formateur.prenom,
    nouvelleAffectation.formation.titre
  );
} catch (error) {
  console.error(
    "Erreur lors de l'envoi de l'email d'affectation :",
    error
  );
}

return nouvelleAffectation;
}

export async function verifierAccesFormation(
  userId: string,
  role: Role,
  formationId: string
) {
  const formation = await prisma.formation.findUnique({
    where: {
      id: formationId,
    },
  });

  if (!formation) {
    throw new Error("Formation introuvable");
  }

  // Un administrateur peut gérer toutes les formations
  if (role === "ADMIN") {
    return true;
  }

  // Les apprenants ne peuvent pas gérer les contenus pédagogiques
  if (role !== "FORMATEUR") {
    throw new Error("Vous n'êtes pas autorisé à gérer cette formation");
  }

  const affectation = await prisma.affectationFormateur.findUnique({
    where: {
      formationId_formateurId: {
        formationId,
        formateurId: userId,
      },
    },
  });

  if (!affectation) {
    throw new Error(
      "Vous n'êtes pas affecté à cette formation"
    );
  }

  return true;
}

export async function getAffectationsByFormation(
  formationId: string
) {
  const formation = await prisma.formation.findUnique({
    where: {
      id: formationId,
    },
  });

  if (!formation) {
    throw new Error("Formation introuvable");
  }

  return prisma.affectationFormateur.findMany({
    where: {
      formationId,
    },

    select: {
      id: true,
      formationId: true,

      formateur: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
        },
      },
    },
  });
}

export async function getAffectationsByFormateur(
  formateurId: string
) {
  const formateur = await prisma.user.findUnique({
    where: {
      id: formateurId,
    },
  });

  if (!formateur) {
    throw new Error("Utilisateur introuvable");
  }

  if (formateur.role !== "FORMATEUR") {
    throw new Error(
      "Cet utilisateur n'est pas un formateur"
    );
  }

  return prisma.affectationFormateur.findMany({
    where: {
      formateurId,
    },

    select: {
      id: true,

      formation: {
        select: {
          id: true,
          titre: true,
          description: true,
          createdAt: true,

          _count: {
            select: {
              cours: true,
              sessions: true,
              inscriptions: true,
            },
          },
        },
      },
    },
  });
}

export async function deleteAffectation(
  affectationId: string
) {
  const affectation =
    await prisma.affectationFormateur.findUnique({
      where: {
        id: affectationId,
      },

      select: {
        id: true,

        formation: {
          select: {
            id: true,
            titre: true,
          },
        },

        formateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

  if (!affectation) {
    throw new Error("Affectation introuvable");
  }

  await prisma.affectationFormateur.delete({
    where: {
      id: affectationId,
    },
  });

  return {
    message: "Affectation supprimée avec succès",
    affectation,
  };
}

interface GetAffectationsParams {
  page: number;
  limit: number;
  search?: string;
}
export async function getAffectationsPaginees(
  params: GetAffectationsParams
) {
  const {
    page,
    limit,
    search,
  } = params;

  const skip = (page - 1) * limit;

  const where = {
    ...(search !== undefined &&
      search.trim() !== "" && {
        OR: [
          {
            formateur: {
              nom: {
                contains: search.trim(),
                mode: "insensitive" as const,
              },
            },
          },
          {
            formateur: {
              prenom: {
                contains: search.trim(),
                mode: "insensitive" as const,
              },
            },
          },
          {
            formateur: {
              email: {
                contains: search.trim(),
                mode: "insensitive" as const,
              },
            },
          },
          {
            formation: {
              titre: {
                contains: search.trim(),
                mode: "insensitive" as const,
              },
            },
          },
        ],
      }),
  };

  const [
    affectations,
    total,
  ] = await Promise.all([
    prisma.affectationFormateur.findMany({
      where,

      skip,
      take: limit,

      orderBy: {
        id: "desc",
      },

      select: {
        id: true,
        formationId: true,
        formateurId: true,

        formateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
          },
        },

        formation: {
          select: {
            id: true,
            titre: true,
            description: true,
          },
        },
      },
    }),

    prisma.affectationFormateur.count({
      where,
    }),
  ]);

  const totalPages =
    Math.ceil(total / limit);

  return {
    affectations,

    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
}
