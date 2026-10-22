import prisma from "../../config/prisma.js";
import { randomBytes } from "node:crypto";

interface CreateFormationData {
  titre: string;
  description?: string;
  prix: number;
  createurId: string;
}

export async function createFormation(data: CreateFormationData) {
  return prisma.formation.create({
    data: {
      titre: data.titre,
      description: data.description,
      prix: data.prix,
      type: data.type,
      niveau: data.type === "CONTINUE" ? (data.niveau ?? null) : null,
      createurId: data.createurId,
    },
    select: {
      id: true,
      titre: true,
      description: true,
      prix: true,
      type: true,
      niveau: true,
      createdAt: true,
      updatedAt: true,
      createur: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
        },
      },
    },
  });
}

export async function getFormations() {
  return prisma.formation.findMany({
    select: {
      id: true,
      titre: true,
      description: true,
      prix: true,
      type: true,
      niveau: true,
      createdAt: true,
      updatedAt: true,
      createur: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

interface UpdateFormationData {
  titre?: string;
  description?: string | null;
  prix?: number;
}

// Détail d'une formation
export async function getFormationById(id: string) {
  const formation = await prisma.formation.findUnique({
    where: {
      id,
    },

    select: {
      id: true,
      titre: true,
      description: true,
      prix: true,
      type: true,
      niveau: true,
      statut: true,
      termineeLe: true,
      createdAt: true,
      updatedAt: true,

      createur: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
        },
      },

      _count: {
        select: {
          cours: true,
          sessions: true,
          affectations: true,
          inscriptions: true,
        },
      },
    },
  });

  if (!formation) {
    throw new Error("Formation introuvable");
  }

  return formation;
}

// Modification d'une formation
export async function updateFormation(
  id: string,
  data: UpdateFormationData
) {
  const formation = await prisma.formation.findUnique({
    where: {
      id,
    },
  });

  if (!formation) {
    throw new Error("Formation introuvable");
  }

  return prisma.formation.update({
    where: {
      id,
    },

    data: {
      ...(data.titre !== undefined && {
        titre: data.titre,
      }),

      ...(data.description !== undefined && {
        description: data.description,
      }),
      ...(data.prix !== undefined && {
        prix: data.prix,
      }),
      ...(data.type !== undefined && {
      type: data.type,
      niveau: data.type === "CONTINUE" ? (data.niveau ?? null) : null,
}),
    },

    select: {
      id: true,
      titre: true,
      description: true,
      prix: true,
      type: true,
      niveau: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

// Suppression sécurisée d'une formation
export async function deleteFormation(id: string) {
  const formation = await prisma.formation.findUnique({
    where: {
      id,
    },

    include: {
      _count: {
        select: {
          cours: true,
          sessions: true,
          affectations: true,
          inscriptions: true,
        },
      },
    },
  });

  if (!formation) {
    throw new Error("Formation introuvable");
  }

  const contientDesDonnees =
    formation._count.cours > 0 ||
    formation._count.sessions > 0 ||
    formation._count.affectations > 0 ||
    formation._count.inscriptions > 0;

  if (contientDesDonnees) {
    throw new Error(
      "Impossible de supprimer cette formation car elle contient encore des cours, sessions, affectations ou inscriptions"
    );
  }

  await prisma.formation.delete({
    where: {
      id,
    },
  });

  return {
    message: "Formation supprimée avec succès",
  };
}

interface GetFormationsParams {
  page: number;
  limit: number;
  search?: string;
}

export async function getFormationsPagines(
  params: GetFormationsParams
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
        ],
      }),
  };

  const [
    formations,
    total,
  ] = await Promise.all([
    prisma.formation.findMany({
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
        prix: true,
        type: true,
        niveau: true,
        statut: true,
        termineeLe: true,
        createdAt: true,
        updatedAt: true,

        createur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },

        _count: {
          select: {
            cours: true,
            sessions: true,
            affectations: true,
            inscriptions: true,
          },
        },
      },
    }),

    prisma.formation.count({
      where,
    }),
  ]);

  const totalPages =
    Math.ceil(total / limit);

  return {
    formations,

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

interface CreateFormationData {
  titre: string;
  description?: string;
  prix: number;
  type: "CONTINUE" | "PROFESSIONNELLE";
  niveau?: "L1" | "L2" | "L3" | "M1" | "M2" | null;
  createurId: string;
}

interface UpdateFormationData {
  titre?: string;
  description?: string | null;
  prix?: number;
  type?: "CONTINUE" | "PROFESSIONNELLE";
  niveau?: "L1" | "L2" | "L3" | "M1" | "M2" | null;
}

// ======================================================
// FIN DE FORMATION ET CERTIFICATS
// ======================================================

// 70 % de la note maximale (20) = 14/20
const SEUIL_REUSSITE = 14;

function genererNumeroCertificat() {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const suffixe = randomBytes(4).toString("hex").toUpperCase();

  // Exemple : CERT-20261022-1A2B3C4D
  return `CERT-${date}-${suffixe}`;
}

// Moyenne des notes de chaque apprenant dont l'inscription est validée
async function calculerResultatsFormation(
  client: Pick<typeof prisma, "inscription">,
  formationId: string
) {
  const inscriptions = await client.inscription.findMany({
    where: {
      formationId,
      statut: "VALIDEE",
    },

    orderBy: {
      dateInscription: "asc",
    },

    select: {
      id: true,

      apprenant: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
        },
      },

      certificat: {
        select: {
          id: true,
        },
      },

      soumissions: {
        select: {
          note: true,
        },
      },
    },
  });

  return inscriptions.map((inscription) => {
    const notes = inscription.soumissions
      .map((soumission) => soumission.note)
      .filter((note): note is number => note !== null);

    const moyenne =
      notes.length > 0
        ? Math.round(
            (notes.reduce((somme, note) => somme + note, 0) /
              notes.length) *
              100
          ) / 100
        : null;

    return {
      inscriptionId: inscription.id,
      apprenant: inscription.apprenant,
      nombreQcm: notes.length,
      moyenne,
      reussi: moyenne !== null && moyenne >= SEUIL_REUSSITE,
      aDejaCertificat: inscription.certificat !== null,
    };
  });
}

// Aperçu affiché à l'admin avant de confirmer la fin de la formation
export async function getApercuFinFormation(formationId: string) {
  const formation = await prisma.formation.findUnique({
    where: {
      id: formationId,
    },

    select: {
      id: true,
      titre: true,
      statut: true,
      termineeLe: true,
    },
  });

  if (!formation) {
    throw new Error("Formation introuvable");
  }

  const resultats = await calculerResultatsFormation(
    prisma,
    formationId
  );

  return {
    formation,
    seuil: SEUIL_REUSSITE,
    eligibles: resultats.filter((resultat) => resultat.reussi),
    nonEligibles: resultats.filter((resultat) => !resultat.reussi),
  };
}

// Termine la formation et délivre les certificats, en une seule transaction
export async function terminerFormation(formationId: string) {
  return prisma.$transaction(async (tx) => {
    const formation = await tx.formation.findUnique({
      where: {
        id: formationId,
      },

      select: {
        id: true,
        statut: true,
      },
    });

    if (!formation) {
      throw new Error("Formation introuvable");
    }

    if (formation.statut === "TERMINEE") {
      throw new Error("Cette formation est déjà terminée");
    }

    const resultats = await calculerResultatsFormation(
      tx,
      formationId
    );

    const reussis = resultats.filter(
      (resultat) => resultat.reussi && !resultat.aDejaCertificat
    );

    const formationTerminee = await tx.formation.update({
      where: {
        id: formationId,
      },

      data: {
        statut: "TERMINEE",
        termineeLe: new Date(),
      },

      select: {
        id: true,
        titre: true,
        statut: true,
        termineeLe: true,
      },
    });

    if (reussis.length > 0) {
      await tx.certificat.createMany({
        data: reussis.map((resultat) => ({
          numero: genererNumeroCertificat(),
          inscriptionId: resultat.inscriptionId,
          moyenne: resultat.moyenne ?? 0,
        })),
      });
    }

    return {
      message: "Formation terminée avec succès",
      formation: formationTerminee,
      nombreApprenants: resultats.length,
      certificatsDelivres: reussis.length,
    };
  });
}