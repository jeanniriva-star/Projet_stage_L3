import prisma from "../../config/prisma.js";
import type { Role } from "../../generated/prisma/enums.js";
import { verifierAccesFormation } from "../affectations/affectation.service.js";
import { verifierInscriptionValidee } from "../inscriptions/inscription.service.js";

interface CreateRessourceData {
  nom: string;
  type: string;
  url: string;
  coursId: string;
}

export async function createRessource(
  data: CreateRessourceData,
  userId: string,
  role: Role
) {
  // Vérifier que le cours existe
  const cours = await prisma.cours.findUnique({
    where: {
      id: data.coursId,
    },
  });

  if (!cours) {
    throw new Error("Cours introuvable");
  }

  // Vérifier que l'ADMIN ou le FORMATEUR
  // a le droit de gérer cette formation
  await verifierAccesFormation(
    userId,
    role,
    cours.formationId
  );

  return prisma.ressourcePedagogique.create({
    data: {
      nom: data.nom,
      type: data.type,
      url: data.url,
      coursId: data.coursId,
    },
    select: {
      id: true,
      nom: true,
      type: true,
      url: true,
      createdAt: true,

      cours: {
        select: {
          id: true,
          titre: true,
          formationId: true,
        },
      },
    },
  });
}

export async function getRessourcesByCours(
  coursId: string,
  userId: string,
  role: Role
) {
  const cours = await prisma.cours.findUnique({
    where: {
      id: coursId,
    },
  });

  if (!cours) {
    throw new Error("Cours introuvable");
  }

 if (role === "APPRENANT") {
  await verifierInscriptionValidee(
    userId,
    cours.formationId
  );
} else {
  await verifierAccesFormation(
    userId,
    role,
    cours.formationId
  );
}

  return prisma.ressourcePedagogique.findMany({
    where: {
      coursId,
    },
    select: {
      id: true,
      nom: true,
      type: true,
      url: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

interface UpdateRessourceData {
  nom?: string;
  type?: string;
  url?: string;
}

export async function updateRessource(
  ressourceId: string,
  data: UpdateRessourceData,
  userId: string,
  role: Role
) {
  const ressource = await prisma.ressourcePedagogique.findUnique({
    where: {
      id: ressourceId,
    },
    include: {
      cours: true,
    },
  });

  if (!ressource) {
    throw new Error("Ressource introuvable");
  }

  await verifierAccesFormation(
    userId,
    role,
    ressource.cours.formationId
  );

  return prisma.ressourcePedagogique.update({
    where: {
      id: ressourceId,
    },
    data: {
      nom: data.nom,
      type: data.type,
      url: data.url,
    },
    select: {
      id: true,
      nom: true,
      type: true,
      url: true,
      createdAt: true,
      cours: {
        select: {
          id: true,
          titre: true,
        },
      },
    },
  });
}

export async function deleteRessource(
  ressourceId: string,
  userId: string,
  role: Role
) {
  const ressource =
    await prisma.ressourcePedagogique.findUnique({
      where: {
        id: ressourceId,
      },

      include: {
        cours: true,
      },
    });

  if (!ressource) {
    throw new Error(
      "Ressource introuvable"
    );
  }

  await verifierAccesFormation(
    userId,
    role,
    ressource.cours.formationId
  );

  await prisma.ressourcePedagogique.delete({
    where: {
      id: ressourceId,
    },
  });

  return ressource;
}

interface GetRessourcesCoursParams {
  coursId: string;
  userId: string;
  role: Role;
  page: number;
  limit: number;
  search?: string;
  type?: string;
}

export async function getRessourcesByCoursPaginees(
  params: GetRessourcesCoursParams
) {
  const {
    coursId,
    userId,
    role,
    page,
    limit,
    search,
    type,
  } = params;

  // Vérifier que le cours existe
  const cours = await prisma.cours.findUnique({
    where: {
      id: coursId,
    },

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
  });

  if (!cours) {
    throw new Error("Cours introuvable");
  }

  // Contrôle d'accès
  if (role === "APPRENANT") {
    await verifierInscriptionValidee(
      userId,
      cours.formationId
    );
  } else {
    await verifierAccesFormation(
      userId,
      role,
      cours.formationId
    );
  }

  const skip = (page - 1) * limit;

  const where = {
    coursId,

    ...(type !== undefined &&
      type.trim() !== "" && {
        type: {
          equals: type.trim(),
          mode: "insensitive" as const,
        },
      }),

    ...(search !== undefined &&
      search.trim() !== "" && {
        OR: [
          {
            nom: {
              contains: search.trim(),
              mode: "insensitive" as const,
            },
          },
          {
            type: {
              contains: search.trim(),
              mode: "insensitive" as const,
            },
          },
          {
            url: {
              contains: search.trim(),
              mode: "insensitive" as const,
            },
          },
        ],
      }),
  };

 const [
  ressources,
  totalFiltre,
  totalRessources,
  ressourcesParType,
] = await Promise.all([
  // Ressources correspondant aux filtres actuels
  prisma.ressourcePedagogique.findMany({
    where,

    skip,
    take: limit,

    orderBy: {
      createdAt: "desc",
    },

    select: {
      id: true,
      nom: true,
      type: true,
      url: true,
      coursId: true,
      createdAt: true,
    },
  }),

  // Nombre de ressources correspondant
  // à la recherche / au filtre actuel
  prisma.ressourcePedagogique.count({
    where,
  }),

  // Nombre total de ressources du cours
  prisma.ressourcePedagogique.count({
    where: {
      coursId,
    },
  }),

  // Nombre de ressources par type
  prisma.ressourcePedagogique.groupBy({
    by: ["type"],

    where: {
      coursId,
    },

    _count: {
      _all: true,
    },
  }),
]);

const parType: Record<string, number> = {};

for (const item of ressourcesParType) {
  const typeNormalise =
    item.type.trim().toUpperCase();

  parType[typeNormalise] =
    (parType[typeNormalise] ?? 0) +
    item._count._all;
}

const totalPages =
  Math.ceil(totalFiltre / limit);

 return {
  cours: {
    id: cours.id,
    titre: cours.titre,

    formation: {
      id: cours.formation.id,
      titre: cours.formation.titre,
    },
  },

  statistiques: {
    total: totalRessources,
    parType,
  },

  ressources,

  pagination: {
    page,
    limit,
    total: totalFiltre,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  },
};
}

export async function getRessourceForDownload(
  ressourceId: string,
  userId: string,
  role: Role
) {
  const ressource =
    await prisma.ressourcePedagogique.findUnique({
      where: {
        id: ressourceId,
      },

      select: {
        id: true,
        nom: true,
        type: true,
        url: true,

        cours: {
          select: {
            id: true,
            formationId: true,
          },
        },
      },
    });

  if (!ressource) {
    throw new Error(
      "Ressource introuvable"
    );
  }

  if (role === "APPRENANT") {
    await verifierInscriptionValidee(
      userId,
      ressource.cours.formationId
    );
  } else {
    await verifierAccesFormation(
      userId,
      role,
      ressource.cours.formationId
    );
  }

  return ressource;
}